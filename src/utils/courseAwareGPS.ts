import { CourseCoordinate, CourseReferencePoint, EnhancedCourseData, ShotValidationResult } from '@/types/course';
import { calculateDistance } from './gpsCalculations';

export interface TriangulationResult {
  coordinates: CourseCoordinate;
  accuracy: number;
  confidence: 'high' | 'medium' | 'low';
  method: 'triangulation' | 'single_reference' | 'gps_only' | 'constraint_based';
  referencePointsUsed: string[];
}

export interface CourseConstraints {
  courseBoundary?: CourseCoordinate[];
  holeNumber?: number;
  validAreas?: ('tee' | 'fairway' | 'rough' | 'green' | 'hazard')[];
  maxDistanceFromTee?: number;
  maxDistanceFromPin?: number;
}

/**
 * Enhanced GPS positioning using course reference points and triangulation
 */
export class CourseAwareGPS {
  private courseData: EnhancedCourseData;
  private referencePoints: CourseReferencePoint[];

  constructor(courseData: EnhancedCourseData) {
    this.courseData = courseData;
    this.referencePoints = [
      ...(courseData.referencePoints || []),
      ...courseData.holes.flatMap(hole => hole.referencePoints || [])
    ];
  }

  /**
   * Get enhanced position using triangulation from reference points
   */
  async getEnhancedPosition(
    gpsReading: CourseCoordinate,
    constraints?: CourseConstraints
  ): Promise<TriangulationResult> {
    // Find nearby reference points
    const nearbyPoints = this.findNearbyReferencePoints(gpsReading, 500); // 500m radius
    
    if (nearbyPoints.length >= 3) {
      return this.triangulatePosition(gpsReading, nearbyPoints, constraints);
    } else if (nearbyPoints.length >= 1) {
      return this.constrainPositionWithReference(gpsReading, nearbyPoints[0], constraints);
    } else {
      return this.applyConstraints(gpsReading, constraints);
    }
  }

  /**
   * Validate a shot against course geometry and constraints
   */
  validateShot(
    shotLocation: CourseCoordinate,
    holeNumber: number,
    shotType: 'drive' | 'approach' | 'putt'
  ): ShotValidationResult {
    const hole = this.courseData.holes.find(h => h.number === holeNumber);
    if (!hole) {
      return {
        isValid: false,
        confidence: 'low',
        warnings: ['Hole not found in course data'],
        estimatedAccuracy: shotLocation.accuracy || 10
      };
    }

    const warnings: string[] = [];
    let estimatedAccuracy = shotLocation.accuracy || 5;

    // Start with high confidence and degrade based on issues
    let finalConfidence: 'high' | 'medium' | 'low' = 'high';
    
    // Check course boundaries
    const isOutOfBounds = this.courseData.courseBoundary && !this.isPointInBoundary(shotLocation, this.courseData.courseBoundary);
    if (isOutOfBounds) {
      warnings.push('Shot appears to be outside course boundaries');
    }

    // Check hole-specific constraints
    const holeConstraints = this.getHoleConstraints(hole, shotType);
    const violatesConstraints = this.checkConstraintViolations(shotLocation, hole, holeConstraints);
    warnings.push(...violatesConstraints.warnings);
    
    // Determine final confidence based on all factors
    if (isOutOfBounds || violatesConstraints.severity === 'high') {
      finalConfidence = 'low';
    } else if (violatesConstraints.severity === 'medium') {
      finalConfidence = 'medium';
    }

    // Improve accuracy if shot aligns with course features
    const nearbyReferences = this.findNearbyReferencePoints(shotLocation, 100);
    if (nearbyReferences.length > 0) {
      estimatedAccuracy = Math.min(estimatedAccuracy, 3); // Better accuracy near reference points
    }

    // Determine course position
    const coursePosition = this.determineCoursePosition(shotLocation, hole);

    return {
      isValid: warnings.length === 0 || finalConfidence !== 'low',
      confidence: finalConfidence,
      warnings,
      estimatedAccuracy,
      coursePosition
    };
  }

  /**
   * Get reference points that can be used for betting
   */
  getBettingReferencePoints(holeNumber: number): CourseReferencePoint[] {
    return this.referencePoints.filter(point => 
      point.holeNumber === holeNumber &&
      ['fairway_marker', 'pin', 'tee_marker', 'sprinkler_head'].includes(point.type) &&
      (point.confidenceScore || 0) > 0.6
    );
  }

  /**
   * Calculate distance to a reference point with improved accuracy
   */
  calculateDistanceToReference(
    shotLocation: CourseCoordinate,
    referencePointId: string
  ): { distance: number; accuracy: number; confidence: 'high' | 'medium' | 'low' } {
    const referencePoint = this.referencePoints.find(p => p.id === referencePointId);
    if (!referencePoint) {
      throw new Error('Reference point not found');
    }

    const distance = calculateDistance(shotLocation, referencePoint.coordinates);
    
    // Combine GPS accuracies
    const combinedAccuracy = Math.sqrt(
      Math.pow(shotLocation.accuracy || 5, 2) + 
      Math.pow(referencePoint.coordinates.accuracy || 3, 2)
    );

    let confidence: 'high' | 'medium' | 'low' = 'medium';
    if (combinedAccuracy <= 2) confidence = 'high';
    else if (combinedAccuracy >= 8) confidence = 'low';

    return {
      distance,
      accuracy: combinedAccuracy,
      confidence
    };
  }

  // Private methods

  private findNearbyReferencePoints(
    location: CourseCoordinate,
    radiusMeters: number
  ): CourseReferencePoint[] {
    return this.referencePoints
      .filter(point => {
        const distance = calculateDistance(location, point.coordinates);
        return distance <= radiusMeters;
      })
      .sort((a, b) => {
        const distA = calculateDistance(location, a.coordinates);
        const distB = calculateDistance(location, b.coordinates);
        return distA - distB;
      });
  }

  private triangulatePosition(
    gpsReading: CourseCoordinate,
    referencePoints: CourseReferencePoint[],
    constraints?: CourseConstraints
  ): TriangulationResult {
    // Simplified triangulation - in practice would use more sophisticated algorithms
    const weights = referencePoints.map(point => {
      const distance = calculateDistance(gpsReading, point.coordinates);
      const confidence = point.confidenceScore || 0.5;
      return confidence / Math.max(distance, 1);
    });

    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    
    let avgLat = 0;
    let avgLng = 0;
    
    referencePoints.forEach((point, i) => {
      const weight = weights[i] / totalWeight;
      avgLat += point.coordinates.latitude * weight;
      avgLng += point.coordinates.longitude * weight;
    });

    // Blend with GPS reading
    const gpsWeight = Math.min(0.5, (gpsReading.accuracy || 10) / 20);
    const triangulatedLat = avgLat * (1 - gpsWeight) + gpsReading.latitude * gpsWeight;
    const triangulatedLng = avgLng * (1 - gpsWeight) + gpsReading.longitude * gpsWeight;

    const estimatedAccuracy = Math.max(1, Math.min(3, (gpsReading.accuracy || 10) * 0.3));

    return {
      coordinates: {
        latitude: triangulatedLat,
        longitude: triangulatedLng,
        accuracy: estimatedAccuracy,
        timestamp: Date.now()
      },
      accuracy: estimatedAccuracy,
      confidence: 'high',
      method: 'triangulation',
      referencePointsUsed: referencePoints.map(p => p.id)
    };
  }

  private constrainPositionWithReference(
    gpsReading: CourseCoordinate,
    referencePoint: CourseReferencePoint,
    constraints?: CourseConstraints
  ): TriangulationResult {
    // Use single reference point to improve accuracy
    const distance = calculateDistance(gpsReading, referencePoint.coordinates);
    const referenceConfidence = referencePoint.confidenceScore || 0.5;
    
    // Weight the GPS reading vs reference point based on their accuracies
    const gpsAccuracy = gpsReading.accuracy || 10;
    const refAccuracy = referencePoint.coordinates.accuracy || 3;
    
    const gpsWeight = refAccuracy / (gpsAccuracy + refAccuracy);
    const refWeight = 1 - gpsWeight;
    
    const adjustedLat = gpsReading.latitude * gpsWeight + referencePoint.coordinates.latitude * refWeight * 0.1;
    const adjustedLng = gpsReading.longitude * gpsWeight + referencePoint.coordinates.longitude * refWeight * 0.1;
    
    const estimatedAccuracy = Math.min(gpsAccuracy, refAccuracy * 2);

    return {
      coordinates: {
        latitude: adjustedLat,
        longitude: adjustedLng,
        accuracy: estimatedAccuracy,
        timestamp: Date.now()
      },
      accuracy: estimatedAccuracy,
      confidence: referenceConfidence > 0.7 ? 'medium' : 'low',
      method: 'single_reference',
      referencePointsUsed: [referencePoint.id]
    };
  }

  private applyConstraints(
    gpsReading: CourseCoordinate,
    constraints?: CourseConstraints
  ): TriangulationResult {
    // Apply course boundary and other constraints to improve GPS reading
    let adjustedCoordinate = { ...gpsReading };
    
    if (constraints?.courseBoundary && !this.isPointInBoundary(gpsReading, constraints.courseBoundary)) {
      // Move point to nearest boundary point
      adjustedCoordinate = this.moveToNearestBoundaryPoint(gpsReading, constraints.courseBoundary);
    }

    return {
      coordinates: adjustedCoordinate,
      accuracy: gpsReading.accuracy || 10,
      confidence: 'low',
      method: 'constraint_based',
      referencePointsUsed: []
    };
  }

  private isPointInBoundary(point: CourseCoordinate, boundary: CourseCoordinate[]): boolean {
    // Simple point-in-polygon algorithm
    let inside = false;
    for (let i = 0, j = boundary.length - 1; i < boundary.length; j = i++) {
      if (((boundary[i].latitude > point.latitude) !== (boundary[j].latitude > point.latitude)) &&
          (point.longitude < (boundary[j].longitude - boundary[i].longitude) * (point.latitude - boundary[i].latitude) / (boundary[j].latitude - boundary[i].latitude) + boundary[i].longitude)) {
        inside = !inside;
      }
    }
    return inside;
  }

  private moveToNearestBoundaryPoint(point: CourseCoordinate, boundary: CourseCoordinate[]): CourseCoordinate {
    let nearestPoint = boundary[0];
    let minDistance = calculateDistance(point, boundary[0]);
    
    boundary.forEach(boundaryPoint => {
      const distance = calculateDistance(point, boundaryPoint);
      if (distance < minDistance) {
        minDistance = distance;
        nearestPoint = boundaryPoint;
      }
    });
    
    return { ...nearestPoint, accuracy: Math.max(point.accuracy || 10, minDistance) };
  }

  private getHoleConstraints(hole: any, shotType: string) {
    const constraints: {
      maxDistanceFromTee: number;
      maxDistanceFromPin: number;
      validAreas: ('tee' | 'fairway' | 'rough' | 'green')[];
    } = {
      maxDistanceFromTee: 600, // 600 meters max drive
      maxDistanceFromPin: 200,  // 200 meters max approach
      validAreas: ['tee', 'fairway', 'rough', 'green']
    };

    if (shotType === 'drive') {
      constraints.validAreas = ['fairway', 'rough'];
      constraints.maxDistanceFromTee = Math.min(600, hole.yardage * 1.5 * 0.9144); // 1.5x hole yardage in meters
    } else if (shotType === 'putt') {
      constraints.validAreas = ['green'];
      constraints.maxDistanceFromPin = 30; // 30 meters from pin
    }

    return constraints;
  }

  private checkConstraintViolations(location: CourseCoordinate, hole: any, constraints: any) {
    const warnings: string[] = [];
    let severity: 'low' | 'medium' | 'high' = 'low';

    // Check distances
    if (hole.teeBoxes && constraints.maxDistanceFromTee) {
      const teeDistances = Object.values(hole.teeBoxes).map((tee: any) => 
        calculateDistance(location, tee.coordinates)
      );
      const minTeeDistance = Math.min(...teeDistances);
      
      if (minTeeDistance > constraints.maxDistanceFromTee) {
        warnings.push(`Shot is ${Math.round(minTeeDistance)}m from tee (max expected: ${constraints.maxDistanceFromTee}m)`);
        severity = 'high';
      } else if (minTeeDistance > constraints.maxDistanceFromTee * 0.8) {
        warnings.push(`Shot is ${Math.round(minTeeDistance)}m from tee (approaching limit: ${constraints.maxDistanceFromTee}m)`);
        severity = 'medium';
      }
    }

    return { warnings, severity };
  }

  private determineCoursePosition(location: CourseCoordinate, hole: any) {
    // Determine which area of the course the shot is in
    let area: 'tee' | 'fairway' | 'rough' | 'green' | 'hazard' | 'out_of_bounds' = 'fairway';
    let distanceToPin: number | undefined;
    let distanceToTee: number | undefined;

    // Calculate distances to key features
    if (hole.pinPositions?.current) {
      distanceToPin = calculateDistance(location, hole.pinPositions.current);
      if (distanceToPin <= 30) area = 'green';
    }

    if (hole.teeBoxes) {
      const teeDistances = Object.values(hole.teeBoxes).map((tee: any) => 
        calculateDistance(location, tee.coordinates)
      );
      distanceToTee = Math.min(...teeDistances);
      if (distanceToTee <= 50) area = 'tee';
    }

    return {
      hole: hole.number,
      area,
      distanceToPin,
      distanceToTee
    };
  }
}

/**
 * Utility functions for course-aware GPS calculations
 */
export const courseAwareGPSUtils = {
  /**
   * Convert meters to yards
   */
  metersToYards: (meters: number): number => meters * 1.09361,

  /**
   * Convert yards to meters  
   */
  yardsToMeters: (yards: number): number => yards * 0.9144,

  /**
   * Calculate accuracy confidence based on multiple factors
   */
  calculateConfidence: (
    gpsAccuracy: number,
    referencePointCount: number,
    courseConstraintMatch: boolean
  ): 'high' | 'medium' | 'low' => {
    let score = 0;
    
    // GPS accuracy contribution (0-4 points)
    if (gpsAccuracy <= 2) score += 4;
    else if (gpsAccuracy <= 5) score += 3;
    else if (gpsAccuracy <= 10) score += 2;
    else score += 1;
    
    // Reference point contribution (0-3 points)
    if (referencePointCount >= 3) score += 3;
    else if (referencePointCount >= 1) score += 2;
    else score += 0;
    
    // Course constraint match (0-2 points)
    if (courseConstraintMatch) score += 2;
    
    if (score >= 7) return 'high';
    if (score >= 4) return 'medium';
    return 'low';
  }
};
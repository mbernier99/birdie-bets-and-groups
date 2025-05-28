
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const imageFile = formData.get('image') as File
    
    if (!imageFile) {
      return new Response(
        JSON.stringify({ error: 'No image file provided' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Convert image to base64 for Google Vision API
    const imageBuffer = await imageFile.arrayBuffer()
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)))

    // Get Google Vision API key from Supabase secrets
    const googleApiKey = Deno.env.get('GOOGLE_VISION_API_KEY')
    
    if (!googleApiKey) {
      return new Response(
        JSON.stringify({ error: 'Google Vision API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Call Google Vision API for text detection
    const visionResponse = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${googleApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              image: {
                content: base64Image,
              },
              features: [
                {
                  type: 'TEXT_DETECTION',
                  maxResults: 50,
                },
              ],
            },
          ],
        }),
      }
    )

    const visionData = await visionResponse.json()
    
    if (!visionData.responses || !visionData.responses[0]) {
      return new Response(
        JSON.stringify({ error: 'Failed to process image' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const textAnnotations = visionData.responses[0].textAnnotations
    
    if (!textAnnotations || textAnnotations.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No text detected in image' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Extract and parse the detected text
    const extractedText = textAnnotations[0].description
    const courseData = parseCoursecardText(extractedText)

    return new Response(
      JSON.stringify({ 
        success: true, 
        courseData,
        extractedText: extractedText // Include for debugging
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error processing scorecard:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

function parseCoursecardText(text: string) {
  console.log('Parsing text:', text)
  
  // Initialize default course data
  const courseData = {
    name: '',
    teeBox: '',
    rating: 0,
    slope: 0,
    holes: Array.from({ length: 18 }, (_, i) => ({
      number: i + 1,
      par: 4,
      yardage: 350,
      handicapIndex: i + 1
    }))
  }

  // Extract course name (usually at the top)
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
  if (lines.length > 0) {
    // Look for a line that seems like a course name (not just numbers)
    const courseNameLine = lines.find(line => 
      line.length > 5 && 
      !/^\d+$/.test(line) && 
      !line.toLowerCase().includes('hole') &&
      !line.toLowerCase().includes('par') &&
      !line.toLowerCase().includes('yardage')
    )
    if (courseNameLine) {
      courseData.name = courseNameLine
    }
  }

  // Look for tee box information
  const teeBoxMatch = text.toLowerCase().match(/(black|blue|white|red|gold)\s*tee/i)
  if (teeBoxMatch) {
    courseData.teeBox = teeBoxMatch[1].toLowerCase()
  }

  // Look for course rating and slope
  const ratingMatch = text.match(/rating[:\s]*(\d+\.?\d*)/i)
  if (ratingMatch) {
    courseData.rating = parseFloat(ratingMatch[1])
  }

  const slopeMatch = text.match(/slope[:\s]*(\d+)/i)
  if (slopeMatch) {
    courseData.slope = parseInt(slopeMatch[1])
  }

  // Parse hole data - look for patterns like "1 4 350 10" (hole, par, yardage, handicap)
  const holePattern = /(\d{1,2})\s+([3-6])\s+(\d{2,4})\s+(\d{1,2})/g
  let match
  let holeIndex = 0

  while ((match = holePattern.exec(text)) !== null && holeIndex < 18) {
    const [, holeNum, par, yardage, handicap] = match
    const hole = parseInt(holeNum)
    
    if (hole >= 1 && hole <= 18) {
      const arrayIndex = hole - 1
      if (arrayIndex < 18) {
        courseData.holes[arrayIndex] = {
          number: hole,
          par: parseInt(par),
          yardage: parseInt(yardage),
          handicapIndex: parseInt(handicap)
        }
        holeIndex++
      }
    }
  }

  // If we didn't find structured hole data, try to find par values in sequence
  if (holeIndex === 0) {
    const parPattern = /par[:\s]*([3-6](?:\s+[3-6])*)/i
    const parMatch = text.match(parPattern)
    if (parMatch) {
      const pars = parMatch[1].split(/\s+/).map(p => parseInt(p)).filter(p => p >= 3 && p <= 6)
      pars.forEach((par, index) => {
        if (index < 18) {
          courseData.holes[index].par = par
        }
      })
    }
  }

  console.log('Parsed course data:', courseData)
  return courseData
}

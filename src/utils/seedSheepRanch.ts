import { supabase } from '@/integrations/supabase/client';

export const seedSheepRanchCourse = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const { data, error } = await supabase.functions.invoke('seed-sheep-ranch', {
      body: {},
    });

    if (error) throw error;

    return {
      success: true,
      message: data.message || 'Sheep Ranch course seeded successfully',
    };
  } catch (error) {
    console.error('Error seeding Sheep Ranch:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to seed Sheep Ranch course',
    };
  }
};

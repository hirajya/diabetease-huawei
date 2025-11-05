import { NextRequest, NextResponse } from 'next/server';

interface NutritionalFacts {
  calories: number;
  carbohydrates: number;
  protein: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  glycemicIndex: number;
}

interface CookingInstruction {
  step: number;
  instruction: string;
  time?: string;
  temperature?: string;
}

interface MealDetails {
  id: string;
  name: string;
  description: string;
  servings: number;
  cookingTime: string;
  difficulty: string;
  nutritionalFacts: NutritionalFacts;
  ingredients: string[];
  cookingInstructions: CookingInstruction[];
  diabeticTips: string[];
  plateMethodBreakdown: {
    vegetables: { items: string[]; percentage: number };
    protein: { items: string[]; percentage: number };
    carbohydrates: { items: string[]; percentage: number };
  };
}

export async function POST(request: NextRequest) {
  try {
    const { mealId, mealName } = await request.json();
    
    if (!mealId && !mealName) {
      return NextResponse.json({ error: 'Meal ID or name required' }, { status: 400 });
    }

    console.log('🍽️ Getting meal details for:', mealId || mealName);

    // DeepSeek API call for detailed meal information
    const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
    
    if (deepseekApiKey && deepseekApiKey !== 'your_deepseek_api_key_here') {
      const deepseekResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${deepseekApiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: `You are a certified diabetes nutritionist. Provide detailed meal information for Type 2 diabetes patients following the plate method.

Return a JSON object with:
- id: string
- name: string
- description: string  
- servings: number
- cookingTime: string
- difficulty: string
- nutritionalFacts: {calories, carbohydrates(g), protein(g), fat(g), fiber(g), sugar(g), sodium(mg), glycemicIndex}
- ingredients: string array with quantities
- cookingInstructions: array of {step, instruction, time?, temperature?}
- diabeticTips: string array of diabetes-specific advice
- plateMethodBreakdown: {vegetables: {items, percentage}, protein: {items, percentage}, carbohydrates: {items, percentage}}

Focus on accurate nutritional data, clear cooking steps, and diabetes management tips.`
            },
            {
              role: 'user',
              content: `Provide complete meal details for: "${mealName || mealId}". Include accurate nutritional facts, step-by-step cooking instructions, and diabetic-friendly tips. Return as valid JSON only.`
            }
          ],
          temperature: 0.3,
          max_tokens: 1500,
        }),
      });

      if (deepseekResponse.ok) {
        const deepseekData = await deepseekResponse.json();
        let mealDetails: MealDetails;

        try {
          const content = deepseekData.choices[0].message.content;
          // Try to extract JSON from the response
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            mealDetails = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error('No JSON object found in response');
          }
          
          console.log(`✅ Generated meal details for: ${mealDetails.name}`);

          return NextResponse.json({
            success: true,
            mealDetails,
          });
        } catch {
          console.log('⚠️ Failed to parse DeepSeek response, using fallback details');
          // Fall through to fallback details
        }
      }
    }

    // Return fallback details
    const fallbackDetails = generateFallbackMealDetails(mealId || mealName || 'Unknown Meal');
    
    return NextResponse.json({
      success: true,
      mealDetails: fallbackDetails,
      note: 'Using fallback details - DeepSeek API not configured or unavailable',
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Meal details error:', errorMessage);
    
    // Return fallback details
    const fallbackDetails = generateFallbackMealDetails('Unknown Meal');
    
    return NextResponse.json({
      success: true,
      mealDetails: fallbackDetails,
      note: 'Using fallback details due to API issues',
    });
  }
}

function generateFallbackMealDetails(mealIdentifier: string): MealDetails {
  // Generate realistic meal details based on the meal identifier
  const mealDetailsMap: { [key: string]: Partial<MealDetails> } = {
    'diabetic-salad-1': {
      name: 'Mediterranean Diabetic Bowl',
      description: 'Fresh vegetables with lean protein and quinoa - perfect for blood sugar control',
      nutritionalFacts: {
        calories: 485,
        carbohydrates: 45,
        protein: 32,
        fat: 18,
        fiber: 12,
        sugar: 8,
        sodium: 580,
        glycemicIndex: 35
      },
      ingredients: [
        '2 cups mixed greens',
        '1 cup cherry tomatoes, halved',
        '1/2 cucumber, diced',
        '1/2 bell pepper, chopped',
        '4 oz grilled chicken breast',
        '1/3 cup cooked chickpeas',
        '1/3 cup cooked quinoa',
        '1 small whole grain pita',
        '2 tbsp olive oil',
        '1 tbsp lemon juice',
        'Fresh herbs (parsley, mint)'
      ]
    },
    'diabetic-fish-2': {
      name: 'Baked Salmon with Vegetables',
      description: 'Omega-3 rich salmon with roasted low-carb vegetables',
      nutritionalFacts: {
        calories: 420,
        carbohydrates: 35,
        protein: 35,
        fat: 16,
        fiber: 10,
        sugar: 6,
        sodium: 450,
        glycemicIndex: 30
      },
      ingredients: [
        '5 oz salmon fillet',
        '1 cup broccoli florets',
        '6 asparagus spears',
        '1/2 cup Brussels sprouts',
        '1/2 medium sweet potato',
        '1/3 cup brown rice',
        '1 tbsp olive oil',
        'Lemon, herbs, spices'
      ]
    }
  };

  const baseDetails = mealDetailsMap[mealIdentifier] || {
    name: 'Healthy Diabetic Meal',
    description: 'Balanced meal following the diabetes plate method',
    nutritionalFacts: {
      calories: 450,
      carbohydrates: 40,
      protein: 30,
      fat: 15,
      fiber: 8,
      sugar: 7,
      sodium: 500,
      glycemicIndex: 40
    },
    ingredients: [
      'Mixed vegetables (2 cups)',
      'Lean protein (4 oz)',
      'Whole grain carbs (1/3 cup)',
      'Healthy fats (1 tbsp)',
      'Herbs and spices'
    ]
  };

  return {
    id: mealIdentifier,
    name: baseDetails.name || 'Healthy Diabetic Meal',
    description: baseDetails.description || 'Balanced meal following the diabetes plate method',
    servings: 1,
    cookingTime: '30 minutes',
    difficulty: 'Easy',
    nutritionalFacts: baseDetails.nutritionalFacts!,
    ingredients: baseDetails.ingredients!,
    cookingInstructions: [
      {
        step: 1,
        instruction: 'Preheat oven to 400°F (200°C). Prepare all ingredients.',
        time: '5 minutes',
        temperature: '400°F'
      },
      {
        step: 2,
        instruction: 'Season protein with herbs and spices. Let marinate briefly.',
        time: '5 minutes'
      },
      {
        step: 3,
        instruction: 'Wash and chop all vegetables into uniform pieces.',
        time: '8 minutes'
      },
      {
        step: 4,
        instruction: 'Cook protein according to recipe (bake, grill, or pan-sear).',
        time: '10-15 minutes'
      },
      {
        step: 5,
        instruction: 'Steam or roast vegetables until tender but still crisp.',
        time: '8-12 minutes'
      },
      {
        step: 6,
        instruction: 'Prepare whole grain carbohydrate portion (rice, quinoa, etc.).',
        time: '15 minutes'
      },
      {
        step: 7,
        instruction: 'Plate using diabetes plate method: 50% vegetables, 25% protein, 25% carbs.',
        time: '2 minutes'
      }
    ],
    diabeticTips: [
      'Monitor portion sizes using the plate method',
      'Eat slowly and chew thoroughly to help blood sugar control',
      'Check blood glucose 2 hours after eating',
      'Pair carbohydrates with protein or healthy fats',
      'Choose non-starchy vegetables to fill half your plate',
      'Opt for whole grains over refined carbohydrates',
      'Stay hydrated with water throughout the meal'
    ],
    plateMethodBreakdown: {
      vegetables: {
        items: ['Non-starchy vegetables', 'Leafy greens', 'Colorful vegetables'],
        percentage: 50
      },
      protein: {
        items: ['Lean meat', 'Fish', 'Legumes', 'Low-fat dairy'],
        percentage: 25
      },
      carbohydrates: {
        items: ['Whole grains', 'Starchy vegetables', 'Legumes'],
        percentage: 25
      }
    }
  };
}
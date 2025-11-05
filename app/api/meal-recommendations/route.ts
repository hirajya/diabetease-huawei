import { NextRequest, NextResponse } from 'next/server';

interface MealRecommendation {
  id: string;
  name: string;
  description: string;
  plateMethod: {
    vegetables: string[];
    protein: string[];
    carbohydrates: string[];
  };
  suitabilityScore: number;
  cookingTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  servings: number;
}

export async function POST(request: NextRequest) {
  try {
    const { ingredients } = await request.json();
    
    if (!ingredients || !Array.isArray(ingredients)) {
      return NextResponse.json({ error: 'Invalid ingredients provided' }, { status: 400 });
    }

    console.log('🍽️ Generating meal recommendations for ingredients:', ingredients);

    // DeepSeek API call
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
              content: `You are a specialized nutritionist for Type 2 diabetes meal planning. Create diabetic-friendly meals using the plate method (50% non-starchy vegetables, 25% lean protein, 25% healthy carbohydrates). 

Return EXACTLY 10 meal recommendations as a JSON array. Each meal must include:
- id: unique identifier
- name: meal name
- description: brief description (max 100 chars)
- plateMethod: object with vegetables[], protein[], carbohydrates[] arrays
- suitabilityScore: number 1-10 (how good for diabetes)
- cookingTime: string like "30 minutes"
- difficulty: "Easy", "Medium", or "Hard"
- servings: number

Focus on low glycemic index foods, high fiber, lean proteins, and portion control. Avoid processed foods, high sugar, and refined carbs.`
            },
            {
              role: 'user',
              content: `Generate 10 diabetic-friendly meal recommendations using these available ingredients: ${ingredients.join(', ')}. Return as valid JSON array only.`
            }
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (deepseekResponse.ok) {
        const deepseekData = await deepseekResponse.json();
        let mealRecommendations: MealRecommendation[];

        try {
          const content = deepseekData.choices[0].message.content;
          // Try to extract JSON from the response
          const jsonMatch = content.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            mealRecommendations = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error('No JSON array found in response');
          }
          
          console.log(`✅ Generated ${mealRecommendations.length} meal recommendations`);

          return NextResponse.json({
            success: true,
            meals: mealRecommendations,
            totalCount: mealRecommendations.length,
          });
        } catch {
          console.log('⚠️ Failed to parse DeepSeek response, using fallback meals');
          // Fall through to fallback meals
        }
      }
    }

    // Return fallback recommendations
    const fallbackMeals = generateFallbackMeals();
    
    return NextResponse.json({
      success: true,
      meals: fallbackMeals,
      totalCount: fallbackMeals.length,
      note: 'Using fallback recommendations - DeepSeek API not configured or unavailable',
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Meal recommendation error:', errorMessage);
    
    // Return fallback recommendations
    const fallbackMeals = generateFallbackMeals();
    
    return NextResponse.json({
      success: true,
      meals: fallbackMeals,
      totalCount: fallbackMeals.length,
      note: 'Using fallback recommendations due to API issues',
    });
  }
}

function generateFallbackMeals(): MealRecommendation[] {
  const baseMeals = [
    {
      id: 'diabetic-salad-1',
      name: 'Mediterranean Diabetic Bowl',
      description: 'Fresh vegetables with lean protein and quinoa',
      plateMethod: {
        vegetables: ['Mixed greens', 'Cherry tomatoes', 'Cucumber', 'Bell peppers'],
        protein: ['Grilled chicken breast', 'Chickpeas'],
        carbohydrates: ['Quinoa', 'Whole grain pita']
      },
      suitabilityScore: 9,
      cookingTime: '25 minutes',
      difficulty: 'Easy' as const,
      servings: 2
    },
    {
      id: 'diabetic-fish-2',
      name: 'Baked Salmon with Vegetables',
      description: 'Omega-3 rich salmon with roasted low-carb vegetables',
      plateMethod: {
        vegetables: ['Broccoli', 'Asparagus', 'Brussels sprouts'],
        protein: ['Salmon fillet'],
        carbohydrates: ['Sweet potato', 'Brown rice']
      },
      suitabilityScore: 10,
      cookingTime: '35 minutes',
      difficulty: 'Medium' as const,
      servings: 1
    },
    {
      id: 'diabetic-chicken-3',
      name: 'Herb-Crusted Chicken Thighs',
      description: 'Juicy chicken with herb seasoning and steamed vegetables',
      plateMethod: {
        vegetables: ['Green beans', 'Cauliflower', 'Carrots'],
        protein: ['Chicken thighs', 'Tofu'],
        carbohydrates: ['Wild rice', 'Barley']
      },
      suitabilityScore: 8,
      cookingTime: '40 minutes',
      difficulty: 'Medium' as const,
      servings: 3
    },
    {
      id: 'diabetic-veggie-4',
      name: 'Lentil and Vegetable Curry',
      description: 'Plant-based protein with diabetes-friendly spices',
      plateMethod: {
        vegetables: ['Spinach', 'Onions', 'Tomatoes', 'Peppers'],
        protein: ['Red lentils', 'Greek yogurt'],
        carbohydrates: ['Brown rice', 'Naan bread (small portion)']
      },
      suitabilityScore: 9,
      cookingTime: '30 minutes',
      difficulty: 'Easy' as const,
      servings: 4
    },
    {
      id: 'diabetic-beef-5',
      name: 'Lean Beef Stir-Fry',
      description: 'Quick stir-fry with colorful vegetables and lean beef',
      plateMethod: {
        vegetables: ['Bok choy', 'Snow peas', 'Mushrooms', 'Red cabbage'],
        protein: ['Lean beef strips'],
        carbohydrates: ['Shirataki noodles', 'Brown rice']
      },
      suitabilityScore: 8,
      cookingTime: '20 minutes',
      difficulty: 'Easy' as const,
      servings: 2
    },
    {
      id: 'diabetic-egg-6',
      name: 'Vegetable Frittata',
      description: 'Protein-rich eggs with fresh vegetables',
      plateMethod: {
        vegetables: ['Zucchini', 'Bell peppers', 'Onions', 'Spinach'],
        protein: ['Eggs', 'Low-fat cheese'],
        carbohydrates: ['Whole grain toast', 'Sweet potato hash']
      },
      suitabilityScore: 9,
      cookingTime: '25 minutes',
      difficulty: 'Easy' as const,
      servings: 4
    },
    {
      id: 'diabetic-turkey-7',
      name: 'Turkey Meatball Zucchini Boats',
      description: 'Low-carb zucchini filled with lean turkey meatballs',
      plateMethod: {
        vegetables: ['Zucchini', 'Tomatoes', 'Basil', 'Spinach'],
        protein: ['Ground turkey', 'Parmesan cheese'],
        carbohydrates: ['Quinoa stuffing', 'Whole grain breadcrumbs']
      },
      suitabilityScore: 9,
      cookingTime: '45 minutes',
      difficulty: 'Medium' as const,
      servings: 3
    },
    {
      id: 'diabetic-shrimp-8',
      name: 'Garlic Shrimp with Cauliflower Rice',
      description: 'Low-carb alternative with protein-rich shrimp',
      plateMethod: {
        vegetables: ['Cauliflower rice', 'Asparagus', 'Cherry tomatoes'],
        protein: ['Shrimp', 'Avocado'],
        carbohydrates: ['Black beans', 'Corn (small portion)']
      },
      suitabilityScore: 10,
      cookingTime: '15 minutes',
      difficulty: 'Easy' as const,
      servings: 2
    },
    {
      id: 'diabetic-pork-9',
      name: 'Pork Tenderloin with Roasted Vegetables',
      description: 'Lean pork with colorful roasted vegetables',
      plateMethod: {
        vegetables: ['Brussels sprouts', 'Carrots', 'Parsnips'],
        protein: ['Pork tenderloin'],
        carbohydrates: ['Roasted sweet potato', 'Quinoa']
      },
      suitabilityScore: 8,
      cookingTime: '50 minutes',
      difficulty: 'Medium' as const,
      servings: 3
    },
    {
      id: 'diabetic-tofu-10',
      name: 'Asian Tofu Buddha Bowl',
      description: 'Plant-based protein bowl with Asian flavors',
      plateMethod: {
        vegetables: ['Edamame', 'Cucumber', 'Radishes', 'Seaweed'],
        protein: ['Firm tofu', 'Hemp seeds'],
        carbohydrates: ['Brown rice', 'Miso soup']
      },
      suitabilityScore: 9,
      cookingTime: '30 minutes',
      difficulty: 'Easy' as const,
      servings: 2
    }
  ];

  return baseMeals;
}
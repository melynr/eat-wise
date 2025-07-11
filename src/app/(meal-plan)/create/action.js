'use server';

import { openai } from '@/utils/openai';

export async function createMealPlan(formData) {
  const budget = formData.get('budget');
  const days = String(formData.get('days'));

  const allergies = formData.get('allergies') || 'tidak ada';
  const type = String(formData.get('type'));
  console.log('Type of cuisine:', type);

  const mealTimes = formData.getAll('mealTimes');
  const frequencyCount = mealTimes.length;

  if (!budget || !days || frequencyCount === 0) {
    return { success: false, message: 'Data wajib diisi tidak lengkap.' };
  }

  const instructions = `You are a smart meal planning assistant designed for users who want to eat healthy, save time, and stay within their budget. Suggest weekly meal plans based on the user's dietary preferences, calorie goals, cooking time availability, and budget constraints.
Your response must follow the format below:

EXAMPLE RESPONSE:

## WEEK Overview  
- Calorie Target: [e.g. 1800/day]  
- Dietary Preference: [e.g. Vegan, Pescatarian, etc.]  
- Budget: [e.g. IDR 400K]  
- Cooking Time: [e.g. ~30 min/day]  

# Day 1  
## BREAKFAST  
### Dish Name: [Dish Name]  
### Ingredients:  
- [Ingredient 1]  
- [Ingredient 2]  
- ...  
### How to Cook:  
[Step-by-step cooking instructions]

## LUNCH  
### Dish Name: [Dish Name]  
### Ingredients:  
- ...  
### How to Cook:  
...

## DINNER  
### Dish Name: [Dish Name]  
### Ingredients:  
- ...  
### How to Cook:  
...

# Day 2  
...continue with the same structure for each day of the week.

Include weekly prep tips, nutrition facts if relevant, smart grocery lists at the end, and offer friendly suggestions like leftovers ideas or meal swaps. Keep the tone warm and helpful.
   `;
  try {
    // const mealPlan = await prisma.mealPlan.create({
    //   data: {
    //     budget: parseInt(budget),
    //     days: parseInt(days),
    //     frequency: parseInt(frequency),
    //     allergies,
    //     type,
    //   },
    // });
    const input = `Create a meal plan with the following details:
     Budget: Rp ${budget}
     Duration: ${days} days
     Frequency: ${mealTimes} meals per day
     Allergies: ${allergies}
     Type of cuisine: ${type}`;
    console.log('Input for OpenAI:', input);
    // const result = await openai.responses.parse({
    //   model: 'gpt-4.1',
    //   instructions: instructions,
    //   input: input,
    //   text: {
    //     format: {
    //       type: 'json_schema',
    //       strict: true,
    //       name: 'meal_plan',
    //       schema: {
    //         type: 'object',
    //         properties: {
    //           weekOverview: {
    //             type: 'object',
    //             properties: {
    //               calorieTarget: { type: 'string' },
    //               dietaryPreference: { type: 'string' },
    //               budget: { type: 'string' },
    //               cookingTime: { type: 'string' },
    //             },
    //             required: ['calorieTarget', 'dietaryPreference', 'budget', 'cookingTime'],
    //             additionalProperties: false,
    //           },
    //           days: {
    //             type: 'array',
    //             items: {
    //               type: 'object',
    //               properties: {
    //                 day: { type: 'string' },
    //                 meals: {
    //                   type: 'array',
    //                   items: {
    //                     type: 'object',
    //                     properties: {
    //                       type: { type: 'string', enum: ['BREAKFAST', 'LUNCH', 'DINNER'] },
    //                       dishName: { type: 'string' },
    //                       ingredients: {
    //                         type: 'array',
    //                         items: { type: 'string' },
    //                       },
    //                       instructions: {
    //                         type: 'array',
    //                         items: { type: 'string' },
    //                       },
    //                       imagePrompt: {
    //                         type: 'string',
    //                         description:
    //                           "Generate an image prompt for the dish, e.g., 'A delicious vegan pasta with fresh vegetables and herbs.'",
    //                       },
    //                     },
    //                     required: ['type', 'dishName', 'ingredients', 'instructions', 'imagePrompt'],
    //                     additionalProperties: false,
    //                   },
    //                 },
    //               },
    //               required: ['day', 'meals'],
    //               additionalProperties: false,
    //             },
    //           },
    //           prepTips: {
    //             type: 'array',
    //             items: { type: 'string' },
    //           },
    //           groceryList: {
    //             type: 'array',
    //             items: { type: 'string' },
    //           },
    //           suggestions: {
    //             type: 'array',
    //             items: { type: 'string' },
    //           },
    //         },
    //         required: ['weekOverview', 'days', 'prepTips', 'groceryList', 'suggestions'],
    //         additionalProperties: false,
    //       },
    //     },
    //   },
    // });

    const result = await openai.responses.parse({
      model: 'gpt-4.1',
      instructions: `You are a smart meal planning assistant designed for users who want to eat healthy, save time, and stay within their budget. Suggest weekly meal plans based on the user's dietary preferences, calorie goals, cooking time availability, and budget constraints. Please provide only the cuisine title in short`,
      input: input,
      text: {
        /*
        day 1 : breakfast(bubur ayam), lunch(ayam geprek), dinner(gado-gado)
day 2 : breakfast(donat ayam), lunch(ayam hijau), dinner(gado-gado pedas)
day 3 : breakfast(donat ayam), lunch(ayam hijau), dinner(gado-gado pedas)*/
        format: {
          type: 'json_schema',
          strict: true,
          name: 'meal_plan',
          schema: {
            type: 'object',
            properties: {
              days: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    breakfast: { type: 'string' },
                    lunch: { type: 'string' },
                    dinner: { type: 'string' },
                  },
                  required: ['breakfast', 'lunch', 'dinner'],
                  additionalProperties: false,
                },
              },
            },
            required: ['days'],
            additionalProperties: false,
          },
        },
      },
    });
    console.log('Meal Plan Result:', result.output_parsed);
    return {
      success: true,
      result: result.output_parsed,
    };
  } catch (error) {
    console.error('Error in createMealPlan:', error);
    return {
      success: false,
      message: 'Error creating meal plan. Please try again later.',
    };
  }
}

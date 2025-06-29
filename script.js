document.getElementById("calculate-calories").addEventListener("click", function() {
    // --- Input Retrieval and Sanitization ---
    function sanitizeInput(input) {
        return input.trim();
    }

    var gender = document.getElementById("gender-calorie").value;
    var age = parseFloat(sanitizeInput(document.getElementById("age-calorie").value));

    var weightInput = sanitizeInput(document.getElementById("weight-calorie").value);
    var weight = parseFloat(weightInput);
    var weightUnit = document.getElementById("weight-unit-calorie").value;

    var heightInput = sanitizeInput(document.getElementById("height-calorie").value);
    var height = parseFloat(heightInput);
    var heightUnit = document.getElementById("height-unit-calorie").value;

    var bodyFatPercentageInput = sanitizeInput(document.getElementById("body-fat-percentage-calorie").value);
    var bodyFatPercentage = parseFloat(bodyFatPercentageInput);

    var activity = document.getElementById("activity-level-calorie").value;
    var goal = document.getElementById("goal-calorie").value;

    var resultElement = document.getElementById("calorie-result");

    // --- Input Validation ---
    if (gender === "") {
        resultElement.textContent = "Please select your Gender.";
        return;
    }
    if (isNaN(age) || age < 1 || age > 120) {
        resultElement.textContent = "Please enter a valid Age (1-120).";
        return;
    }
    if (isNaN(weight) || weight <= 0) {
        resultElement.textContent = "Please enter a valid Weight (greater than zero).";
        return;
    }
    if (isNaN(height) || height <= 0) {
        resultElement.textContent = "Please enter a valid Height (greater than zero).";
        return;
    }

    // Validate optional Body Fat Percentage if provided
    var useLeanBodyMass = false;
    var leanBodyMassKg; // Will store LBM in kilograms
    if (bodyFatPercentageInput !== "") {
        if (isNaN(bodyFatPercentage) || bodyFatPercentage < 1 || bodyFatPercentage > 60) {
            resultElement.textContent = "Please enter a valid Body Fat Percentage (1-60%).";
            return;
        }
        useLeanBodyMass = true;
    }

    // --- Unit Conversions (Internal calculations will use KG for weight, CM for height) ---
    var weightKg = weight;
    if (weightUnit === "lbs") {
        weightKg = weight * 0.453592; // Convert lbs to kg
    }
    console.log("Weight (kg):", weightKg.toFixed(2));

    var heightCm = height;
    if (heightUnit === "inches") {
        heightCm = height * 2.54; // Convert inches to cm
    }
    console.log("Height (cm):", heightCm.toFixed(2));

    // --- Lean Body Mass Calculation (if BFP provided) ---
    if (useLeanBodyMass) {
        var fatMassKg = weightKg * (bodyFatPercentage / 100);
        leanBodyMassKg = weightKg - fatMassKg;

        if (leanBodyMassKg <= 0) {
            resultElement.textContent = "Invalid Body Fat Percentage resulting in zero or negative lean mass. Please check your inputs.";
            return;
        }
        console.log("Lean Body Mass (kg):", leanBodyMassKg.toFixed(2));
    }

    // --- Basal Metabolic Rate (BMR) Calculation ---
    var bmr;
    if (useLeanBodyMass) {
        // Katch-McArdle Formula (more accurate with LBM)
        bmr = 370 + (21.6 * leanBodyMassKg);
        console.log("BMR (Katch-McArdle):", bmr.toFixed(2));
    } else {
        // Mifflin-St Jeor Equation (general purpose)
        if (gender === "male") {
            bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5;
        } else { // female
            bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161;
        }
        console.log("BMR (Mifflin-St Jeor):", bmr.toFixed(2));
    }

    // --- Total Daily Energy Expenditure (TDEE) Calculation ---
    // Activity Multipliers (These are standard values)
    var activityMultipliers = {
        "sedentary": 1.2,
        "light": 1.375,
        "moderate": 1.55,
        "very": 1.725,
        "extra": 1.9 // Matches your "extra" option from HTML
    };

    var activityFactor = activityMultipliers[activity];
    if (activityFactor === undefined) {
        resultElement.textContent = "Please select a valid Activity Level.";
        return;
    }
    console.log("Activity Factor:", activityFactor);

    var tdee = bmr * activityFactor;
    console.log("TDEE:", tdee.toFixed(2));

    // --- Adjust for Goal ---
    var recommendedCalories;
    var adjustmentAmount; // Placeholder for how much to add/subtract

    // Common calorie adjustments for goals
    // These are often flat amounts or percentages. Let's use flat amounts for simplicity,
    // which can be adjusted. A common deficit/surplus is 250-500 calories.
    var calorieAdjustments = {
        "maintenance": 0, // No adjustment
        "muscle-gain": 300, // Add 300 calories for muscle gain
        "fat-loss": -500   // Subtract 500 calories for fat loss (common deficit)
    };

    adjustmentAmount = calorieAdjustments[goal];
    if (adjustmentAmount === undefined) {
        resultElement.textContent = "Please select a valid Goal.";
        return;
    }

    recommendedCalories = tdee + adjustmentAmount;

    // Ensure calories don't go too low (e.g., minimums for health)
    // These are general guidelines, consult a professional for specific advice.
    var minCalories = 1200; // General minimum for women
    if (gender === "male") {
        minCalories = 1500; // General minimum for men
    }
    if (recommendedCalories < minCalories) {
        recommendedCalories = minCalories;
        console.warn(`Adjusted calories up to minimum healthy intake: ${minCalories}`);
        resultElement.textContent = `Recommended calorie intake: ${recommendedCalories.toFixed(0)} calories. (Adjusted to a healthy minimum)`;
    } else {
        resultElement.textContent = `Recommended calorie intake: ${recommendedCalories.toFixed(0)} calories.`;
    }

    console.log("Recommended Calories:", recommendedCalories.toFixed(0));
});

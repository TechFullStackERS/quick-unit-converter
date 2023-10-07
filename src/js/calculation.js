const inputField = document.getElementById("input");
const convertButton = document.getElementById("convert");
const resultElement = document.getElementById("result");

convertButton.addEventListener("click", () => {
	const inputText = inputField.value;
	const output = evaluateResultForInput(inputText);

	if (output.error) resultElement.textContent = `Error: ${output.error}`;
	else resultElement.textContent = `Result: ${toOptionalFixed(output.value, 4)} ${output.unit}`;
});

function toOptionalFixed(num, digits) {
	return Number.parseFloat(num.toFixed(digits));
}

function evaluateResultForInput(inputText) {
	// Regular expression to match and parse input in the following format:
	// e.g., "10 kg and 200 g to lbs" or "5 kg to lbs"
	const regex = /^(\d+(\.\d+)?)\s([a-zA-Z]+)\s+(and\s+(\d+(\.\d+)?)\s+([a-zA-Z]+)\s+)?to\s+([a-zA-Z]+)$/;
	const match = inputText.toLowerCase().match(regex);

	if (!match) return { error: "Invalid command entered. Please use the correct format, e.g. '10 kg to lbs' or '1 kg and 200 g to pounds" };

	if (isTwoUnitsInMatchArray(match)) return convertFromTwoUnits(match);
	else return convertFromOneUnit(match);
}

function unitNameToCorrectForm(value, unit) {
	if (value === 1) return uppercaseFirstChar(unit);

	const mapping = {
		"kilogram": "Kilograms",
		"kg": "Kilograms",
		"pound": "Pounds",
		"lb": "Pounds",
		"gram": "Grams",
		"g": "Grams",
		"liter": "Liters",
		"l": "Liters",
		"gallon": "Gallons",
		"gal": "Gallons",
		"milliliter": "Milliliters",
		"ml": "Milliliters",
		"°c": "Celsius",
		"c": "Celsius",
		"°f": "Fahrenheit",
		"f": "Fahrenheit",
		"k": "Kelvin",
		"second": "Seconds",
		"sec": "Seconds",
		"s": "Seconds",
		"minute": "Minutes",
		"min": "Minutes",
		"hour": "Hours",
		"hr": "Hours",
		"day": "Days",
		"d": "Days"
	};

	return mapping[unit.toLowerCase()] || uppercaseFirstChar(unit);
}

function uppercaseFirstChar(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

function convertUnitNameToFormulaKey(unit) {
	const mapping = {
		"kilograms": "kilogram",
		"kgs": "kilogram",
		"kg": "kilogram",
		"pounds": "pound",
		"lb": "pound",
		"lbs": "pound",
		"grams": "gram",
		"g": "gram",
		"liters": "liter",
		"l": "liter",
		"gallons": "gallon",
		"gal": "gallon",
		"milliliters": "milliliter",
		"ml": "milliliter",
		"c": "celsius",
		"°c": "celsius",
		"f": "fahrenheit",
		"°f": "fahrenheit",
		"k": "kelvin",
		"seconds": "second",
		"sec": "second",
		"secs": "second",
		"s": "second",
		"minutes": "minute",
		"min": "minute",
		"mins": "minute",
		"hours": "hour",
		"hr": "hour",
		"hrs": "hour",
		"days": "day",
		"d": "day"
	};

	return mapping[unit.toLowerCase()] || unit;
}

function isTwoUnitsInMatchArray(match) {
	// In case of two unit input, second-last element will not be undefined
	// (e.g. 1 kg and 500 g to kg"
	return match[match.length - 2] !== undefined;
}

function convertFromOneUnit(match) {
	const [, inputValue, , inputUnit, , , , , outputUnit] = match;

	const normalizedInputUnit = convertUnitNameToFormulaKey(inputUnit);
	const normalizedOutputUnit = convertUnitNameToFormulaKey(outputUnit);

	const result = convertValue(inputValue, normalizedInputUnit, normalizedOutputUnit);
	if (result.error) return result;

	const value = result.value;
	const unit = unitNameToCorrectForm(value, normalizedOutputUnit);
    console.log("returnUnit", unit);
	return { value, unit };
}

function convertFromTwoUnits(match) {
	const [, inputValue1, , inputUnit1, , inputValue2, , inputUnit2, outputUnit] = match;

	const normalizedInputUnit1 = convertUnitNameToFormulaKey(inputUnit1);
	const normalizedInputUnit2 = convertUnitNameToFormulaKey(inputUnit2);
	const normalizedOutputUnit = convertUnitNameToFormulaKey(outputUnit);
	const output1 = convertValue(inputValue1, normalizedInputUnit1, normalizedOutputUnit);
	const output2 = convertValue(inputValue2, normalizedInputUnit2, normalizedOutputUnit);

	if (output1.error) return output1;
	if (output2.error) return output2;

	const value = output1.value + output2.value;
	const unit = unitNameToCorrectForm(value, normalizedOutputUnit);
	return { value, unit };
}

function getUnitTypeOrError(inputUnit, outputUnit) {
	const inputType = getTypeForUnit(inputUnit);
	const outputType = getTypeForUnit(outputUnit);

	if (!inputType && !outputType) return { error: `${inputUnit} and ${outputUnit} are not valid units` };
	else if (!inputType) return { error: `${inputUnit} is not a valid unit` };
	else if (!outputType) return { error: `${outputUnit} is not a valid unit` };
	else if (inputType !== outputType)
		return {
			error: `${inputType} (${inputUnit}) can not be converted to ${outputType} (${outputUnit})`
		};

	return { unitType: inputType };
}

function convertValue(inputValue, inputUnit, outputUnit) {
	const response = getUnitTypeOrError(inputUnit, outputUnit);
	if (response.error) return response;

	const { unitType } = response;
	const conversionFunction = formulae[unitType];

	const convertInputToBaseUnit = conversionFunction.toBaseUnit[inputUnit];
	const convertBaseToOutputUnit = conversionFunction.fromBaseUnit[outputUnit];

	const valueInBaseUnit = convertInputToBaseUnit(Number(inputValue));
	const result = convertBaseToOutputUnit(valueInBaseUnit);

	return { value: result };
}

function getTypeForUnit(unit) {
	const normalizedUnit = convertUnitNameToFormulaKey(unit);

	for (const type in formulae) {
		if (formulae[type].toBaseUnit[normalizedUnit] && formulae[type].fromBaseUnit[normalizedUnit]) {
			return type;
		}
	}
	return null;
}

const formulae = {
	length: {
		toBaseUnit: {
			meter: value => value,
			kilometer: value => value * 1000,
			mile: value => value / 0.00062137,
			foot: value => value / 3.2808,
			inch: value => value / 39.3701
		},
		fromBaseUnit: {
			meter: value => value,
			kilometer: value => value / 1000,
			mile: value => value * 0.00062137,
			foot: value => value * 3.2808,
			inch: value => value * 39.3701
		}
	},
	mass: {
		toBaseUnit: {
			kilogram: value => value * 1000,
			pound: value => value * 453.592,
			gram: value => value
		},
		fromBaseUnit: {
			kilogram: value => value / 1000,
			pound: value => value / 453.592,
			gram: value => value
		}
	},
	volume: {
		toBaseUnit: {
			liter: value => value * 1000,
			gallon: value => value * 3785.41,
			milliliter: value => value
		},
		fromBaseUnit: {
			liter: value => value / 1000,
			gallon: value => value / 3785.41,
			milliliter: value => value
		}
	},
	temperature: {
		toBaseUnit: {
			celsius: value => value,
			fahrenheit: value => ((value - 32) * 5) / 9,
			kelvin: value => value - 273.15
		},
		fromBaseUnit: {
			celsius: value => value,
			fahrenheit: value => (value * 9) / 5 + 32,
			kelvin: value => value + 273.15
		}
	},
	time: {
		toBaseUnit: {
			second: value => value,
			minute: value => value * 60,
			hour: value => value * 3600,
			day: value => value * 86400
		},
		fromBaseUnit: {
			second: value => value,
			minute: value => value / 60,
			hour: value => value / 3600,
			day: value => value / 86400
		}
	}
};

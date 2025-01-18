
export function generateNextLabel(existingLabels) {
  // Generate all possible labels from the string
  const GeneratedLabels = generateLabels();
  console.log(GeneratedLabels.sort())

  // Find the first label not in the existing labels
  for (const label of GeneratedLabels) {
    if (!existingLabels.includes(label)) {
      return label; // Return the first available label
    }
  }

  return null; // Return null if no label is available
}

export function getMinAvailableNumber(existingNumbers) {
  // Convert strings to numbers and create a Set for fast lookup
  const numberSet = new Set(existingNumbers.map(Number));

  // Start checking from 1
  let minNumber = 1;

  // Increment until we find a missing number
  while (numberSet.has(minNumber)) {
    minNumber++;
  }

  return minNumber;
}

export function generateLabels(inputString = "abc") {
  const labels = [];
  const length = inputString.length;

  // Helper function to generate combinations recursively
  function generateCombinations(prefix, start) {
    if (prefix) {
      labels.push(prefix); // Add non-empty combinations
    }
    for (let i = start; i < length; i++) {
      generateCombinations(prefix + inputString[i], i + 1);
    }
  }

  // Start generating combinations
  generateCombinations('', 0);

  return labels;
}


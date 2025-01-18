
export function generateNextLabel(existingLabels) {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';
  let label = '';

  if (existingLabels.length === 0) {
    return 'a'; // First label
  }

  const lastLabel = existingLabels.sort().pop(); // Get the last used label
  let carry = true;
  label = lastLabel;

  for (let i = label.length - 1; i >= 0; i--) {
    const currentIndex = alphabet.indexOf(label[i]);
    if (carry) {
      if (currentIndex === alphabet.length - 1) {
        label = label.substring(0, i) + 'a' + label.substring(i + 1); // Wrap to 'a'
      } else {
        label = label.substring(0, i) + alphabet[currentIndex + 1] + label.substring(i + 1); // Increment
        carry = false;
      }
    }
  }

  if (carry) {
    label = 'a' + label; // Add a new letter if needed
  }

  return label;
}



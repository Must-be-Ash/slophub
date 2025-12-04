export async function conditionStep(input: {
  condition: boolean;
}) {
  "use step";
  
  // Evaluate condition
  return { condition: input.condition };
}
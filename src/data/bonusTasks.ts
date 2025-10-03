export const bonusTasks = [
  "Take a group selfie with the bartender",
  "Order a drink in a fake accent",
  "Get someone to toast with you",
  "Compliment a stranger's outfit",
  "Make the bartender laugh",
  "Take a photo doing a cheers pose",
  "Get a bar napkin signed by staff",
  "Strike up a conversation with another group",
  "Order the bartender's favorite drink",
  "Take a photo with the bar's signage",
  "Learn the bartender's name",
  "Share a fun fact with the group",
  "Do a team dance move together",
  "Get a business card from the bar",
  "Ask for a drink recommendation",
  "Take a photo of the team in action",
  "Toast to the birthday person",
  "Get someone to join your photo",
  "Find something unique about the bar",
  "Make a new friend at the bar",
];

export function getRandomBonusTask(): string {
  return bonusTasks[Math.floor(Math.random() * bonusTasks.length)];
}


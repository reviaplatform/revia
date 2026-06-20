import moment from 'moment-timezone';

// Parses a duration string and returns the corresponding time in milliseconds from now
export function parseDuration(duration: string): number {
  // Define the time units and their corresponding values in milliseconds
  const units: { [key: string]: number } = {
    m: 60 * 1000, // minutes
    h: 60 * 60 * 1000, // hours
    d: 24 * 60 * 60 * 1000, // days
    y: 365 * 24 * 60 * 60 * 1000, // years (approximate)
  };

  // Regular expression to match the duration format (number followed by a unit)
  const regex = /^(\d+)([mhdwy])$/;
  const match = duration.match(regex);

  // If the format is invalid 'm', 'h', 'd', or 'y'
  if (!match) {
    return Date.now();
  }

  // Extract the value and unit from the matched groups
  const value = parseInt(match[1], 10);
  const unit = match[2];

  // If the unit is not supported 'm', 'h', 'd', or 'y'
  if (!units[unit]) {
    return Date.now();
  }

  // Return the current time plus the parsed duration in milliseconds
  return Date.now() + value * units[unit];
}

// Generates a strong password of the specified length
export function generateStrongPassword(length: number = 10): string {
  // Define character sets for different types of characters
  const upperCaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowerCaseChars = 'abcdefghijklmnopqrstuvwxyz';
  const digits = '0123456789';
  const specialChars = '!@#$%^&*()-_=+[]{}|;:,.<>?';
  const allChars = upperCaseChars + lowerCaseChars + digits + specialChars;

  // Function to get a random character from a given set of characters
  const getRandomChar = (characters: string): string =>
    characters.charAt(Math.floor(Math.random() * characters.length));

  // Ensure the password includes at least one character from each category
  const passwordArray = [
    getRandomChar(upperCaseChars),
    getRandomChar(lowerCaseChars),
    getRandomChar(digits),
    getRandomChar(specialChars),
  ];

  // Fill the rest of the password length with random characters from all categories
  for (let i = 4; i < length; i++) {
    passwordArray.push(getRandomChar(allChars));
  }

  // Shuffle the password array to ensure randomness
  for (let i = passwordArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]];
  }

  // Join the array into a string and return the generated password
  return passwordArray.join('');
}

// Validate timestamp
export const isTimestampValid = (timestamp: number): boolean => {
  const FIVE_MINUTES = 5 * 60 * 1000; // 5 minutes in milliseconds
  const currentTime = Date.now();

  return Math.abs(currentTime - timestamp) <= FIVE_MINUTES;
};

// Truncate text to a specified length
export function truncateText(text: string, maxLength: number): string {
  // If the text is already shorter than or equal to the maxLength, simply return
  if (text.length <= maxLength) {
    return text;
  }

  // If the maxLength is less than or equal to 3, return the truncated text
  if (maxLength <= 3) {
    return text.slice(0, maxLength);
  }

  // Truncate the text to maxLength - 3 to make space for the ellipsis.
  return text.slice(0, maxLength - 3) + '...';
}

// Convert a date to a specific time zone
const TIMEZONE = 'Africa/Cairo';
export function converToTimeZone(
  date: string | Date | number | null,
  timeZone: string = TIMEZONE,
): string {
  // Convert the date to the specified time zone
  const convertedDate = date ? moment(date).tz(timeZone).format() : '';

  // Return the converted date
  return convertedDate;
}

// Convert a time to a specific time zone
export function converTimeToTimeZone(time: string | Date | number): string {
  return moment.utc(time, 'HH:mm:ss').tz(TIMEZONE).format('HH:mm:ss');
}

// Generate a username based on the user's full name and phone number
export async function createUserName(fullName: string, phoneNumber: string): Promise<string> {
  const cleanPhoneNumber: string = phoneNumber.replace(/\D/g, '');

  const firstName: string = fullName.split(' ')[0].slice(0, 12);

  const numberMap: { [key: string]: string } = {
    '0': '5',
    '1': '8',
    '2': '7',
    '3': '0',
    '4': '1',
    '5': '4',
    '6': '6',
    '7': '9',
    '8': '2',
    '9': '3',
  };

  const modifiedPhoneNumber: string = cleanPhoneNumber
    .slice(-8)
    .split('')
    .map(digit => numberMap[digit])
    .join('');

  const username: string = `${firstName.toUpperCase()}-${modifiedPhoneNumber}`;

  return username;
}

// Generate a random OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Round a number to the nearest half
export function roundToNearestHalf(num: number): number {
  return Math.round(num * 2) / 2;
}

export const getAgeFromBirthday = (birthday: string | null): number => {
  if (!birthday) {
    return 21; // Default age if the birthday is not provided
  }

  // Validate the birthday format using regex
  const dateRegex = /^(0[1-9]|[12][0-9]|3[01]):(0[1-9]|1[0-2]):(\d{4})$/;
  if (!dateRegex.test(birthday)) {
    return 21; // Default age if the format is invalid
  }

  // Extract day, month, and year from the string
  const [day, month, year] = birthday.split(':').map(Number);

  // Convert to a Date object
  const birthDate = new Date(year, month - 1, day); // month is 0-based in JS

  // Get the current date
  const today = new Date();

  // Calculate the age
  let age = today.getFullYear() - birthDate.getFullYear();

  // Adjust if birthday hasn't occurred yet this year
  if (
    today.getMonth() < birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
};

const EGYPT_TZ = 'Africa/Cairo';

export function utcToEgyptTime(utcTime: string) {
  return moment
    .tz(utcTime, 'HH:mm', 'UTC') // parse as UTC time
    .tz(EGYPT_TZ) // convert to Egypt time
    .format('HH:mm'); // keep only time
}

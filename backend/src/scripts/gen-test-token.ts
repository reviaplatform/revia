/**
 * Mints a short-lived USER access token for an existing customer, signed with
 * the same USER_ACCESS_TOKEN_KEY the running server verifies against.
 *
 * For local load testing only — never run this against a production database.
 *
 * Usage:
 *   npx ts-node -r tsconfig-paths/register ./src/scripts/gen-test-token.ts
 */

import { config } from 'dotenv';
config();

import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import Config from '@/config/env';

async function main() {
  await mongoose.connect(Config.MONGODB_URI);
  const customer = await mongoose.connection.collection('customers').findOne({});
  if (!customer) {
    console.error('No customer documents found in the database.');
    process.exit(1);
  }
  const token = jwt.sign({ id: customer['_id'].toString() }, Config.USER_ACCESS_TOKEN_KEY, {
    expiresIn: '1h',
  });
  console.log(token);
  process.exit(0);
}

main();

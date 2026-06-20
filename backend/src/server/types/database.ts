import mongoose, { isValidObjectId } from 'mongoose';

// Type alias for a populated document relation
export type Relation<T> = mongoose.PopulatedDoc<mongoose.Document<mongoose.ObjectId> & T>;

// Type alias for a list of populated document relations
export type RelationList<T> = Relation<T>[];

// Exporting mongoose ObjectId type
export const ObjectId = mongoose.Schema.Types.ObjectId;

// Function to validate if a given string is a valid MongoDB ObjectId
export function validateId(id: string): boolean {
  return isValidObjectId(id);
}

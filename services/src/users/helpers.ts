import { getDb } from '../db/mongoInit';
import { ICreateUserArgs } from './types';

export const createUser: (args: ICreateUserArgs) => any = async ({ email }) => {
  const mongoDB = await getDb();

  const { acknowledged, insertedId } = await mongoDB
    .collection('users')
    .insertOne({
      email,
    });

  return { acknowledged, insertedId };
};

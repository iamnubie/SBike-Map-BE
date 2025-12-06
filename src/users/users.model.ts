import { Schema, Document } from 'mongoose';

const UserSchema = new Schema(
    {
        username: { type: String, required: true },
        password: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        //   createdAt: { type: Date, default: Date.now },
    },
    {
        timestamps: true,
        collection: 'users'
    }
);

export {UserSchema};

export interface User extends Document {
    username: string;
    password: string;
    email: string;
    // createdAt: Date;
}
import { Injectable } from "@nestjs/common";
import { BaseRepository } from "src/base.repository";
import { User } from "./users.model";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

@Injectable()
export class UserRepository extends BaseRepository<User> {
    constructor(
        @InjectModel('User') 
        private readonly userModel: Model<User>,
    ) {
        super(userModel);
    }
}
import bcrypt from 'bcryptjs';
import logger from './util/logger';
import { PostType } from '@prisma/client';
import postData from './mock_post_data';

const start = new Date();
const passwordHash = bcrypt.hashSync('5Tn67Znw4GE',10); // took ~183ms on a ryzen7 4800H @ 2.9GHz
const end = new Date();
logger.info(`Time to hash: ${end.getMilliseconds()-start.getMilliseconds()}ms`); // yes, this is sometimes negative, I'm lazy

export default function () {

    (async () => {

        logger.info('Loading mock data...');
        logger.debug("Deleting old data...");
        // make sure to delete in the right order to prevent invalid forign keys

        await prismaClient.communityMember.deleteMany();
        await prismaClient.post.deleteMany();
        await prismaClient.community.deleteMany();
        await prismaClient.loginInfo.deleteMany();
        await prismaClient.user.deleteMany();

        logger.debug("Deleted old data!");
        logger.debug("Generating new mock data...");

        const UnknownUser = (await prismaClient.user.create({
            data: {
                Name: 'UnknownUser',
                DisplayName: 'Anonymous User',
                Bio: '',
                Dob: new Date(),
                IsAdmin: false
            }
        })).UserID;
        const admin = (await prismaClient.user.create({
            data: {
                Name: 'Admin',
                DisplayName: 'Admin',
                Bio: '',
                Dob: new Date(),
                IsAdmin: false
            }
        })).UserID;

        await prismaClient.loginInfo.create({
            data: {
                Email:'admin',
                Password:passwordHash,
                IsAdmin:true,
                UserID: admin
            }
        });
        await prismaClient.loginInfo.create({
            data: {
                Email:'unknownuser',
                Password:passwordHash,
                IsAdmin: false,
                UserID: UnknownUser
            }
        });

        await prismaClient.community.create({
            data: {
                Name: "SCP foundation",
                Description: "Secure. Contain. Protect.",
                CreatedBy: (await prismaClient.user.findFirst({skip:1}))!.UserID
            }
        });

        await prismaClient.communityMember.create({
            data: {
                CommunityID: (await prismaClient.community.findFirst())!.CommunityID,
                UserID: (await prismaClient.user.findFirst({skip:1}))!.UserID
            }
        });

        for (const post of postData) {
            await prismaClient.post.create({
                data: {
                    Title: post.title,
                    Description: post.description,
                    Class: post.class,
                    Body: post.body,
                    CommunityID: (await prismaClient.community.findFirst())!.CommunityID,
                    AuthorID: (await prismaClient.user.findFirst())!.UserID,
                    Url: post.image,
                    Type: post.image ? PostType.IMAGE : PostType.TEXT
                }
            });
        }
    
        logger.debug("Generated mock data!");
        
        logger.info('Loaded mock data!');
    })();
}
import bcrypt from 'bcrypt';
import logger from './util/logger';
import { PostType } from '@prisma/client';
import postData from './mock_post_data';

const start = new Date();
const passwordHash = bcrypt.hashSync('5Tn67Znw4GE',12); // took ~183ms on a ryzen7 4800H @ 2.9GHz
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

        await prismaClient.user.create({
            data: {
                Name: 'UnknownUser',
                DisplayName: 'Unknown User',
                Bio: '',
                IsAdmin: false
            }
        });
        await prismaClient.user.create({
            data: {
                Name: 'Admin',
                DisplayName: 'Admin',
                Bio: '',
                IsAdmin: false
            }
        });

        logger.info((await prismaClient.user.findFirst({skip:1}))!.DisplayName+" - "+(await prismaClient.user.findFirst())!.DisplayName)

        await prismaClient.loginInfo.create({
            data: {
                Email:'admin',
                Password:passwordHash,
                IsAdmin:true,
                UserID: (await prismaClient.user.findFirst({skip:1}))!.UserID
            }
        });
        await prismaClient.loginInfo.create({
            data: {
                Email:'unknownuser',
                Password:passwordHash,
                IsAdmin: false,
                UserID: (await prismaClient.user.findFirst())!.UserID
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
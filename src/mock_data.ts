import bcrypt from 'bcrypt';
import logger from './util/logger';
import { PostType } from '@prisma/client';

const start = new Date();
const passwordHash = bcrypt.hashSync('Password123',12); // took ~183ms on a ryzen7 4800H @ 2.9GHz
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

        for (let i=100;i--;)
            await prismaClient.user.create({
                data: {
                    Name: "testUser_"+i,
                    DisplayName: "<h1>testUser</h1>_"+i,
                    Bio: "<h1>test</h1>",
                    IsAdmin: false
                }
            })

        await prismaClient.loginInfo.create({
            data: {
                Email:'admin',
                Password:passwordHash,
                IsAdmin:true,
                UserID: (await prismaClient.user.findFirst())!.UserID
            }
        });
        await prismaClient.loginInfo.create({
            data: {
                Email:'testuser',
                Password:passwordHash,
                IsAdmin: false,
                UserID: (await prismaClient.user.findFirst({skip:1}))!.UserID
            }
        });
        await prismaClient.loginInfo.create({
            data: {
                Email:'<h1>testuser</h1>',
                Password:passwordHash,
                IsAdmin: false,
                UserID: (await prismaClient.user.findMany())[2]?.UserID
            }
        });

        await prismaClient.community.create({
            data: {
                Name: "<h1>testCommunity</h1>",
                Description: "<h1>test community description</h1>",
                CreatedBy: (await prismaClient.user.findFirst())!.UserID
            }
        })

        for (let i=100;i--;) {
            await prismaClient.post.create({
                data: {
                    Title: "testPost_"+i,
                    Body: "<h1>test post body</h1>_"+i,
                    CommunityID: (await prismaClient.community.findFirst())!.CommunityID,
                    AuthorID: (await prismaClient.user.findFirst())!.UserID,
                    Type: PostType.TEXT
                }
            })
        }

        logger.info(JSON.stringify(await prismaClient.communityMember.create({
            data: {
                CommunityID: (await prismaClient.community.findFirst())!.CommunityID,
                UserID: (await prismaClient.user.findFirst({skip:1}))!.UserID
            }
        })));
    
        logger.debug("Generated mock data!");
        
        logger.info('Loaded mock data!');
    })();
}
import Route from "../../types/route";
import { PostCreateData } from "../../types/post_data";
import logger from "../../util/logger";

const fetch_post:Route = ['/fetch/post', 'GET', 'none', async (req:any,res:any) => {
    
    if (!req.query.id) {
        res.status(404).contentType('text').send('missing post id parameter (?id=)');
        return;
    }

    try {
        const post = await prismaClient.post.findUnique({
            where: {
                PostID: req.query.id,
                IsDeleted:false
            },
            select: {
                PostID:true,
                Title:true,
                Community: {
                    select: {
                        CommunityID: true,
                        Name: true
                    }
                },
                Type:true,
                Url:true,
                Description:true,
                Body:true,
                Rating:true,
                Author: {
                    select: {
                        UserID: true,
                        DisplayName: true
                    }
                },
                LastEdited:true,
                IsLocked:true,
                PostedAt:true
            }
        });

        if (post)
            res.status(200).contentType("json").send(JSON.stringify(post));
        else
            res.status(404).contentType('json').send('{"error":"invalid_id"}');

    } catch (error:any) {
        if (error.code === 'P2023') {
            logger.info('fuck');
            res.status(404).contentType("json").send('{"error":"invalid_id"}');
        } else {
            logger.error(error);
        }
    }
}];

const fetch_next:Route = ['/fetch/next', 'GET', 'none', async (req:any,res:any) => {

    const fetch = parseInt(req.query.fetch);
    const skip = parseInt(req.query.skip);

    try {
        const posts = await prismaClient.post.findMany({
            take: !!fetch && fetch > 0 ? fetch : 10,
            skip: !!skip && skip > 0 ? skip : 0,
            where: {
                IsDeleted:false
            },
            orderBy: {
                PostedAt: 'asc'
            },
            select: {
                PostID:true,
                Title:true,
                Community: {
                    select: {
                        CommunityID: true,
                        Name: true
                    }
                },
                Type:true,
                Url:true,
                Description:true,
                Class:true,
                Body:true,
                Rating:true,
                Author: {
                    select: {
                        UserID: true,
                        DisplayName: true
                    }
                },
                LastEdited:true,
                IsLocked:true,
                PostedAt:true
            }
        });

        res.status(200).contentType("json").send(JSON.stringify(posts));

    } catch (error:any) {
        if (error.code === 'P2023') {
            res.status(404).contentType("json").send('{"error":"invalid_id"}');
        } else {
            logger.error(error);
        }
    }
}];

const create_post:Route = ['/create/post', 'POST', 'required', async (req:any,res:any) => {

    if (!req.is('application/json')) {
        res.status(415).contentType('json').send('{"error":"invalid_content_type","desc":"content type must be JSON"}');
        return;
    }

    if (!req.body || !PostCreateData.instanceOf(req.body)) {
        res.status(422).contentType('json').send('{"error":"invalid_or_missing_fields"}')
    }

    try {

        if (!await prismaClient.communityMember.findUnique({
            where: {
                UserID_CommunityID: {
                    UserID: req.auth.userID,
                    CommunityID: req.body.communityID,
                }
            }
        })) {
            res.status(422).contentType('json').send('{"error":"invalid_community_id","desc":"either invalid id, or not a member of the community"}');
            return;
        }
        
        const post = await prismaClient.post.create({
            data: {
                Title: req.body.title,
                Type: req.body.type,
                Community: {
                    connect: {
                        CommunityID: req.CommunityID
                    }
                },
                Author: {
                    connect: {
                        UserID: req.auth.userID
                    }
                }
            }
        });

        res.status(200).contentType("json").send(`{"status":"success","postID":"${post.PostID}"}`);

    } catch (error:any) {
        //if (error.code === 'P2023') {
        //    res.status(404).contentType("json").send('{"error":"invalid_id"}');
        //} else {
            //logger.error(error);
            throw error;
        //}
    }

}];

const routeList:Route[] = [
    fetch_post,
    fetch_next,
    create_post
];

export default routeList;
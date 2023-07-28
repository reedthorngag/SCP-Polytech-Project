import Route from "../types/route";
import logger from "../util/logger";

const fetch_post:Route = ['/fetch/post', 'GET', 'optional', async (req:any,res:any) => {
    
    if (!req.query.id) {
        res.status(404).send('missing post id parameter (?id=)');
        return;
    }

    const post = await prismaClient.post.findUnique({
        where: {
            PostID:(await prismaClient.post.findFirst())!.PostID,//req.query.id,
            IsDeleted:false
        },
        select: {
            Title:true,
            Community: {
                select: {
                    CommunityID: true,
                    Name: true
                }
            },
            Type:true,
            Url:true,
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

    res.status(200).contentType("json").send(JSON.stringify(post));

}];

const routeList:Route[] = [
    fetch_post
];

export default routeList;
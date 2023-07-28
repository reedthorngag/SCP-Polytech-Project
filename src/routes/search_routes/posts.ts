import Route from "../../types/route";

const search_posts:Route = ['/search/posts','GET','none', async (req:any,res:any) => {

    if (!req.query.param) {
        res.status(404).send('missing search parameter (?param=)');
        return;
    }

    const number = parseInt(req.query.skip);

    const posts = await prismaClient.post.findMany({
        skip: !!number && number>0? number : 0,
        take: 10,
        orderBy: {
            _relevance: {
                fields: ['Title','Body'],
                search: req.query.param,
                sort: 'asc'
            }
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

    res.status(200).contentType('json').send(JSON.stringify(posts));

}];


const routeList:Route[] = [
    search_posts
]

export default routeList;
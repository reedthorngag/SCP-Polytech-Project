import Route from "../../types/route";


const profile:Route = ['/profile','GET','required', async (req:any,res:any) => {

    const auth = JSON.parse(Buffer.from(req.cookies.auth.split('.')[1],'base64').toString('ascii'));

    const user = await prismaClient.user.findFirst({
        where: {
            UserID:auth.UserID,
            IsDeleted:false
        },
        select: {
            DisplayName:true,
            Bio:true,
            CommentsScore:true,
            PostsScore:true,
            IsAdmin:true
        }
    });

    if (!user) {
        res.status(500).send('User not found! (try login again)');
        return;
    }

    res.status(200).contentType("json").send(JSON.stringify(user))

}]

const routeList:Route[] = [
    profile
]

export default routeList;


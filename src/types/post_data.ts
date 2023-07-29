
export class PostCreateData {

    static instanceOf(object:any):boolean {
        if (typeof object.title !== 'string')
            return false;
        if (typeof object.communityID !== 'string')
            return false;
        if (!['TEXT','IMAGE','GIF','VIDEO','LINK'].includes(object.type))
            return false;
        if (!object.body && !object.url)
            return false;

        return true;
    }
}






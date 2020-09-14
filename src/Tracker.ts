import { CheckManga } from './models/CheckManga'
import { DeleteManga } from './models/DeleteManga'
import { MatchManga } from './models/MatchManga'
import { Request } from './models/RequestObject' // FIX: Remove when going to production
import { SaveManga } from './models/SaveManga'
import { ScoringFormat } from './models/ScoringFormat'
import { User } from './models/User'

export abstract class Tracker {
    // <-----------        REQUIRED METHODS        -----------> //

    // Returns the version of the source
    // Ensures that the app is using the most up to date version
    /**
     * Required class variable which denotes the current version of the application. 
     * This is what the application uses to determine whether it needs to update it's local
     * version of the source, to a new version on the repository
     */
    abstract get version(): string

    /**
     * The title of this tracker, this is what will show up in the application
     */
    abstract get name(): string

    /**
     * An INTERNAL reference to an icon which is associated with this tracker.
     * This Icon should ideally be a matching aspect ratio (a cube)
     * The location of this should be in an includes directory next to your source.
     * For example, the Anilist link sits at: src/Anilist/includes/icon.png
     * This {@link Tracker.icon} field would then be simply referenced as 'icon.png' and
     * the path will then resolve correctly internally
     */
    abstract get icon(): string

    /**
     * The author of this tracker. The string here will be shown off to the public on the application
     * interface, so only write what you're comfortable with showing
     */
    abstract get author(): string

    /**
     * An optional field where the author may put a link to their website
     */
    get authorWebsite(): string | null { return null }

    /**
     * A brief description of what this source targets. This is additional content displayed to the user when 
     * browsing sources. 
     * What website does it target? What features are working? Etc.
     */
    abstract get description(): string

    /**
     * A function returning a request for the trackers OAuth code, which will help us generate the access and refresh tokens
     * @param clientId 
     * @param redirectUri
     * @returns A {@link Request} the request is able to launch the login and accepting process of Anilist 
     */
    abstract OAuthCodeRequest(clientId: string, redirectUri: string): Request

    /**
     * Used to retrieve authToken for later requests regarding user information
     * @param clientId 
     * @param clientSecret 
     * @param redirectUri 
     * @param code Authorization Code retrieved from the previous function call of {@link Tracker.OAuthCodeRequest}
     * @returns A {@link Request} the request is able to launch the login and accepting process of Anilist
     */
    abstract OAuthTokenRequest(clientId: string, clientSecret: string, redirectUri: string, code: string): Request

    /**
     * A function that will generate the neccessary {@link Request} to retrieve information about the authenticated user
     * @param auth Authentication Token
     */
    abstract userRequest(auth: string): Request

    /**
     * Modify the data returned from {@link Tracker.userRequest} to match the {@link User} class 
     * @param data 
     * @param metadata Anything that is passed to {@link Tracker.userRequest}'s Request object as
     * metadata, will be available populating this field as well. 
     */
    abstract user(data: any, metadata: any): User


    /**
     * Since we have manga coming from different sources, we need to ensure that we track the correct one
     * Returns 
     * @param manga 
     * @param page Allows for multiple paging (not sure if will be supported)
     */
    abstract matchMangaRequest(manga: string, page?: number): Request

    /**
     * Modify the data returned from {@link Tracker.matchMangaRequest} to match the {@link MatchManga} class 
     * @param data 
     * @param metadata Anything that is passed to {@link Tracker.matchMangaRequest}'s Request object as
     * metadata, will be available populating this field as well. 
     */
    abstract matchManga(data: any, metadata: any): MatchManga[]

    /**
     * The function allows us to check whether the user was already tracking the manga and pull all pertinent information
     * @param auth Authentication Token
     * @param userId 
     * @param mangaId 
     * @param scoreFormat Anilist has a different way to score so this is needed for the returned GraphQL
     */
    abstract checkMangaRequest(auth: string, userId: string, mangaId: string, scoreFormat?: ScoringFormat): Request
    
    /**
     * Modify the data returned from {@link Tracker.checkMangaRequest} to match the {@link CheckManga} class 
     * @param data 
     * @param metadata Anything that is passed to {@link Tracker.checkMangaRequest}'s Request object as
     * metadata, will be available populating this field as well. 
     */
    abstract checkManga(data: any, metadata: any): CheckManga

    /**
     * This allows you to update or save a manga to the list
     * @param id 
     * @param auth 
     * @param status 
     * @param score 
     * @param scoreFormat 
     * @param progress 
     * @param progressVolumes 
     * @param repeat 
     * @param privateManga Used in anilist: allows you to track but hide the manga from public
     */
    abstract saveMangaRequest(
        id: number,
        auth: string,
        status?: string,
        score?: number,
        scoreFormat?: ScoringFormat,
        progress?: number,
        progressVolumes?: number,
        repeat?: number,
        privateManga?: boolean): Request

    /**
     * Modify the data returned from {@link Tracker.saveMangaRequest} to match the {@link SaveManga} class 
     * @param data 
     * @param metadata Anything that is passed to {@link Tracker.saveMangaRequest}'s Request object as
     * metadata, will be available populating this field as well. 
     */
    abstract saveManga(data: any, metadata: any): SaveManga

    /**
     * Deletes a manga from the user's list and will no longer be tracked
     * @param auth 
     * @param mangaId 
     */
    abstract deleteMangaRequest(auth: string, mangaId: number): Request

    /**
     * Modify the data returned from {@link Tracker.deleteMangaRequest} to match the {@link DeleteManga} class 
     * @param data 
     * @param metadata Anything that is passed to {@link Tracker.deleteMangaRequest}'s Request object as
     * metadata, will be available populating this field as well. 
     */
    abstract deleteManga(data: any, metadata: any): DeleteManga
}
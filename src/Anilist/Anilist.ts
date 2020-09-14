import { createCheckMangaObject, CheckManga } from '../models/CheckManga';
import { createDeleteMangaObject, DeleteManga } from '../models/DeleteManga';
import { createMatchMangaObject, MatchManga } from '../models/MatchManga';
import { createRequestObject, Request } from '../models/RequestObject' // FIX: Remove when going to production
import { createSaveMangaObject, SaveManga } from '../models/SaveManga';
import { ScoringFormat } from '../models/ScoringFormat';
import { createUserObject, User } from '../models/User';
import { Tracker } from '../Tracker';

const URL = 'https://graphql.anilist.co';

export class Anilist extends Tracker {
    get version(): string { return '0.0.1' }
    get name(): string { return 'Anilist' }
    get icon(): string { return 'icon.png' }
    get author(): string { return 'Daniel Kovalevich' }
    get authorWebsite(): string { return 'https://github.com/DanielKovalevich' }
    get description(): string { return 'Anilist integration to allow you to track your manga from the application' }

    OAuthCodeRequest(clientId: string, redirectUri: string): Request {
        return createRequestObject({
            url: `https://anilist.co/api/v2/oauth/authorize`,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            method: 'POST',
            param: `?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code`
        });
    }

    OAuthTokenRequest(clientId: string, clientSecret: string, redirectUri: string, code: string): Request {
        let body = JSON.stringify({
            'grant_type': 'authorization_code',
            'client_id': clientId,
            'client_secret': clientSecret,
            'redirect_uri': redirectUri, 
            'code': code,
        });

        return createRequestObject({
            url: 'https://anilist.co/api/v2/oauth/token',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            method: 'POST',
            data: body
        });
    }

    userRequest(auth: string): Request {
        let query = `query {
            Viewer {
                id
                name
                mediaListOptions {
                    scoreFormat
                }
                siteUrl
            }
        }`;

        let body = JSON.stringify({
            query: query
        });

        return createRequestObject({
            url: URL,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${auth}`
            },
            method: 'POST',
            data: body
        });
    }

    user(data: any, metadata: any): User {
        data = data.data.Viewer;
        return createUserObject({
            id: data.id,
            name: data.name,
            scoringFormat: data.mediaListOptions.scoreFormat,
            site: data.siteUrl
        });
    }

    matchMangaRequest(manga: string, page: number): Request {
        let query = `query ($id: Int, $page: Int, $perPage: Int, $search: String) {
            Page (page: $page, perPage: $perPage) {
                pageInfo {
                    total
                    currentPage
                    lastPage
                    hasNextPage
                    perPage
                }
                media (id: $id, search: $search) {
                    id
                    title {
                        romaji
                        english
                        native
                    }
                    coverImage {
                        large
                    }
                }
            }
        }`;

        let variables = {
            search: manga,
            page: page,
            perPage: 5
        };

        let body = JSON.stringify({
            query: query,
            variables: variables
        });

        return createRequestObject({
            url: URL,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            method: 'POST',
            data: body
        });
    }

    matchManga(data: any, metadata: any): MatchManga[] {
        data = data.data.Page;
        return data.media.map((item: any) => {
            return createMatchMangaObject({
                mangaId: item.id,
                title: item.title,
                imageUrl: item.coverImage.large
            })
        });
    }

    /**
     * It will return the id of the item in the list - the id is needed to be used in DeleteManga
     */
    checkMangaRequest(auth: string, userId: string, mangaId: string, scoreFormat?: ScoringFormat): Request {
        let query = `query ($userId: Int, $mediaId: Int, $scoreFormat: ScoreFormat,) {
            MediaList (userId: $userId, mediaId: $mediaId) {
                id
                status
                score (format: $scoreFormat)
                progress
                progressVolumes
                repeat
                private
            }
        }`;

        let variables = {
            userId: userId,
            mediaId: mangaId,
            scoreFormat: scoreFormat
        };

        let body = JSON.stringify({
            query: query,
            variables: variables
        });

        return createRequestObject({
            url: URL,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${auth}`
            },
            method: 'POST',
            data: body
        });
    }

    checkManga(data: any, metadata: any): CheckManga {
        data = data.data.MediaList;
        return createCheckMangaObject({
            mangaListId: data.id,
            status: data.status,
            score: data.score,
            progress: data.progress,
            progressVolumes: data.progressVolumes,
            repeat: data.repeat,
            private: data.private
        });
    }

    /**
     * This allows you to update or save a manga to the list 
     * It will return the id of the item in the list - the id is needed to be used in DeleteManga
     * @param id 
     * @param status 
     * @param auth 
     * @param progress 
     * @param repeat 
     * @param privateManga 
     */
    saveMangaRequest(
        id: number,
        auth: string,
        status?: string,
        score?: number,
        scoreFormat?: ScoringFormat,
        progress?: number,
        progressVolumes?: number,
        repeat?: number,
        privateManga?: boolean): Request {
        
        let query = `
            mutation ($mediaId: Int, $status: MediaListStatus, $score: Float, $scoreFormat: ScoreFormat, $progress: Int, $progressVolumes: Int, $repeat: Int, $private: Boolean) {
                SaveMediaListEntry (mediaId: $mediaId, status: $status, score: $score, progress: $progress, progressVolumes: $progressVolumes, repeat: $repeat, private: $private) {
                    id
                    status
                    score (format: $scoreFormat)
                    progress
                    progressVolumes
                    repeat
                    private
                }
            }`;

        let variables = {
            'mediaId': id,
            'status': status,
            'score': score,
            'scoreFormat': scoreFormat,
            'progress': progress,
            'progressVolumes': progressVolumes,
            'repeat': repeat,
            'privateManga': privateManga
        };

        let body = JSON.stringify({
            query: query,
            variables: variables
        });

        return createRequestObject({
            url: URL,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${auth}`
            },
            method: 'POST',
            data: body
        });
    }

    saveManga(data: any, metadata: any): SaveManga {
        data = data.data.SaveMediaListEntry;
        return createSaveMangaObject({
            mangaListId: data.id,
            status: data.status,
            score: data.score,
            progress: data.progress,
            progressVolumes: data.progressVolumes,
            repeat: data.repeat,
            private: data.private
        });
    }

    /**
     * Deletes a manga from the user's list and will no longer be tracked
     * @param auth 
     * @param mangaListId Not the mangaId. This is the id of the manga in a user's list
     */
    deleteMangaRequest(auth: string, mangaListId: number): Request {
        let query = `
            mutation ($id: Int) {
                DeleteMediaListEntry (id: $id) {
                    deleted
                }
            }`;

        let variables = {
            'id': mangaListId,
        };
        let body = JSON.stringify({
            query: query,
            variables: variables
        });
        
        return createRequestObject({
            url: URL,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${auth}`
            },
            method: 'POST',
            data: body
        });
    }

    deleteManga(data: any, metadata: any): DeleteManga {
        data = data.data.DeleteMediaListEntry;
        return createDeleteMangaObject({
            deleted: data.deleted
        });
    }
}
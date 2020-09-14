// Half assed code by Daniel

import fetch from 'node-fetch';
import { Anilist } from './Anilist/Anilist';
import { Request } from './models/RequestObject';
import { ScoringFormat } from './models/ScoringFormat';

export class APIWrapper {
    async OAuthCode(tracker: any, clientId: string, redirectUri: string): Promise<any> {
        let request = tracker.OAuthCodeRequest(clientId, redirectUri);
        return await fetch(request);
    }

    async OAuthToken(tracker: any, clientId: string, clientSecret: string, redirectUri: string, code: string): Promise<any> {
        let request = tracker.OAuthTokenRequest(clientId, clientSecret, redirectUri, code);
        return await fetch(request.url, request.options)
            .then(this.handleResponse)
            .catch((e) => console.log(e));
    }

    async user(tracker: any, auth: string): Promise<any> {
        let request: Request = tracker.userRequest(auth);
        let fetchOptions = {
            headers: request.headers,
            method: request.method,
            body: request.data
        };

        return await fetch(request.url, fetchOptions)
            .then(this.handleResponse)
            .then((data: any) => tracker.user(data))
            .catch((e) => console.log(e));
    }

    async matchManga(tracker: any, manga: string): Promise<any> {
        let request = tracker.matchMangaRequest(manga, 1);
        let fetchOptions = {
            headers: request.headers,
            method: request.method,
            body: request.data
        };
        return await fetch(request.url, fetchOptions)
            .then(this.handleResponse)
            .then((data: any) => tracker.matchManga(data))
            .catch((e) => console.log(e));
    }

    async checkManga(tracker: any, auth: string, viewer: string, manga: string): Promise<any> {
        let request = tracker.checkMangaRequest(auth, viewer, manga);
        let fetchOptions = {
            headers: request.headers,
            method: request.method,
            body: request.data
        };
        return await fetch(request.url, fetchOptions)
            .then(this.handleResponse)
            .then((data: any) => tracker.checkManga(data))
            .catch((e) => console.log(e));
    }

    async saveManga(
        tracker: any, 
        mangaId: number, 
        auth: string,
        status?: string,
        score?: number,
        scoreFormat?: ScoringFormat,
        progress?: number,
        progressVolumes?: number,
        repeat?: number,
        privateManga?: boolean): Promise<any> {

        let request = tracker.saveMangaRequest(mangaId, auth, status, score, scoreFormat, progress, progressVolumes, repeat, privateManga);
        let fetchOptions = {
            headers: request.headers,
            method: request.method,
            body: request.data
        };
        return await fetch(request.url, fetchOptions)
            .then(this.handleResponse)
            .then((data: any) => tracker.saveManga(data))
            .catch((e) => console.log(e));
    }

    async deleteManga(tracker: any, auth: string, mangaListId: number): Promise<any> {
        let request = tracker.deleteMangaRequest(auth, mangaListId);
        let fetchOptions = {
            headers: request.headers,
            method: request.method,
            body: request.data
        };
        return await fetch(request.url, fetchOptions)
            .then(this.handleResponse)
            .then((data: any) => tracker.deleteManga(data))
            .catch((e) => console.log(e.errors[0]));
    }

    private handleResponse(response: any) {
        return response.json().then(function (json: any) {
            return response.ok ? json : Promise.reject(json);
        });
    }
}

// MY TESTING FRAMEWORK - LOL
let application = new APIWrapper();

let anilist = new Anilist();
let secret = 'you can\'t have my secrets he he he';
let code = '';
let auth = '';
let clientId = ''
let redirect = 'Test';
let viewerId = '691274'; // created a test user - follow it, if you want lol
// application.OAuthCode(anilist, clientId, redirect).then((val) => console.log(val));
// application.OAuthToken(anilist, clientId, secret, redirect, code).then((val) => console.log(val));
// application.user(anilist, auth).then((val) => console.log(val));
// application.matchManga(anilist, 'attack').then((val) => console.log(val));
// application.checkManga(anilist, auth, viewerId, '53390').then((val) => console.log(val));
// application.saveManga(anilist, 53390, auth, undefined, 9.8, 'POINT_10_DECIMAL', 71, 2).then((val) => console.log(val));
// application.deleteManga(anilist, auth, 137473063).then((val) => console.log(val));
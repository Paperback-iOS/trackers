export interface MatchManga {
    mangaId: number,
    title: Record<string, string>, // language and then name
    imageUrl: string
}

declare global {
    function createMatchMangaObject(matchMangaObject: MatchManga): MatchManga
}

export function createMatchMangaObject(matchMangaObject: MatchManga): MatchManga {
    return matchMangaObject
}
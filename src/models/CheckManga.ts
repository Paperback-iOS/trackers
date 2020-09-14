export interface CheckManga {
    mangaListId: number,
    status?: string,
    score?: number,
    progress?: number,
    progressVolumes?: number,
    repeat?: number,
    private?: boolean
}

declare global {
    function createCheckMangaObject(checkMangaObject: CheckManga): CheckManga
}

export function createCheckMangaObject(checkMangaObject: CheckManga): CheckManga {
    return checkMangaObject
}
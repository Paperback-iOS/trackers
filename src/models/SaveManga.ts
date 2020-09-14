export interface SaveManga {
    mangaListId: number,
    status: string,
    score: number,
    progress: number,
    progressVolumes: number,
    repeat: number,
    private?: boolean
}

declare global {
    function createSaveMangaObject(saveMangaObject: SaveManga): SaveManga
}

export function createSaveMangaObject(saveMangaObject: SaveManga): SaveManga {
    return saveMangaObject
}
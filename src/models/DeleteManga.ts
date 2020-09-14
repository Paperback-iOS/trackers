export interface DeleteManga {
    deleted: boolean
}

declare global {
    function createDeleteMangaObject(deleteMangaObject: DeleteManga): DeleteManga
}

export function createDeleteMangaObject(deleteMangaObject: DeleteManga): DeleteManga {
    return deleteMangaObject
}
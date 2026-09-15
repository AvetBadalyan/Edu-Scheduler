import { AppDataSource } from '../data-source'
import { University } from '../entities'

/**
 * Returns the University if it exists and is owned by userId, otherwise null.
 * Used by entity routes to enforce ownership on every operation.
 */
export async function getOwnedUniversity(
	universityId: string,
	userId: string
): Promise<University | null> {
	const uni = await AppDataSource.getRepository(University).findOneBy({ id: universityId })
	if (!uni || uni.ownerId !== userId) return null
	return uni
}

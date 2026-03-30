import api from './api';

export interface SkillOption {
	id: number;
	name: string;
}

export async function getSkills(): Promise<SkillOption[]> {
	const res = await api.get('/api/skills?sort=name,asc');
	return res.data;
}

export const apiInstanse = async (endPoint: string, options?: RequestInit) => {
	const baseUrl = process.env.NEXT_PUBLIC_API_URL;

	try {
		const response = await fetch(`${baseUrl}/${endPoint}`, options);
		if (!response.ok) {
			throw new Error("Network response was not ok");
		}
		return response.json();
	} catch (error) {
		console.error("Error fetching data:", error);
		return error;
	}
};

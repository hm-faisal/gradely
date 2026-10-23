import { useState } from "react";

export const useSubmissionDetails = () => {
	const [open, setOpen] = useState(false);

	return { open, setOpen };
};

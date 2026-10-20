import {
	prismaCloud,
	prismaState,
} from "@prisma/composer-prisma-cloud/control";
import { defineConfig as composer } from "@prisma/composer/config";
import { nodeBuild } from "@prisma/composer/node/control";
import { defineConfig as ormConfig } from "@prisma/orm-postgres/config";
import "dotenv/config";
import { definePrismaConfig } from "prisma/config";

export default definePrismaConfig({
	skills: {
		agents: ["claude", "cursor", "agents", "devin"],
	},
	orm: ormConfig({
		contract: "./src/prisma/contract.prisma",
		db: {
			connection: process.env.DATABASE_URL as string,
		},
	}),
	composer: composer({
		extensions: [prismaCloud({ region: "us-east-1" }), nodeBuild()],
		state: prismaState(),
	}),
});

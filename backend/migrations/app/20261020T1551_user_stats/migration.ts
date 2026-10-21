#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/c483accf0de0f0be13e33e8533dc6a0a8a2a70eae5db6844f4651713214d621b/contract';
import endContract from '../../snapshots/c483accf0de0f0be13e33e8533dc6a0a8a2a70eae5db6844f4651713214d621b/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/eaa9dd9c3eaa945bd18513b380ec7b107a1621b34b50211afcfc6ed76a732731/contract';
import startContract from '../../snapshots/eaa9dd9c3eaa945bd18513b380ec7b107a1621b34b50211afcfc6ed76a732731/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, placeholder } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.dataTransform(endContract, 'typechange-Submission-projectName', {
        check: () => placeholder('typechange-Submission-projectName:check'),
        run: () => placeholder('typechange-Submission-projectName:run'),
      }),
      this.alterColumnType({
        schema: 'public',
        table: 'Submission',
        column: 'projectName',
        options: {
          qualifiedTargetType: 'text',
          formatTypeExpected: 'text',
          rawTargetTypeForLabel: 'text',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);

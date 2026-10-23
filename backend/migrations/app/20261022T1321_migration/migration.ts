#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/27061e711bfb6d260bbe828b6fa88ad77c2d88693b1d5aa1777ebb32921bc197/contract';
import endContract from '../../snapshots/27061e711bfb6d260bbe828b6fa88ad77c2d88693b1d5aa1777ebb32921bc197/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/c483accf0de0f0be13e33e8533dc6a0a8a2a70eae5db6844f4651713214d621b/contract';
import startContract from '../../snapshots/c483accf0de0f0be13e33e8533dc6a0a8a2a70eae5db6844f4651713214d621b/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.dropCheckConstraint({
        schema: 'public',
        table: 'User',
        constraint: 'User_role_check_482f18a5',
      }),
      this.createTable({
        schema: 'public',
        table: 'Feedback',
        columns: [
          col('content', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('reviewerId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('submissionId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Feedback',
        constraint: 'Feedback_submissionId_key',
        columns: ['submissionId'],
      }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'User',
        constraint: 'User_role_check_08578c34',
        expression: `"role" IN ('STUDENT', 'ADMIN', 'REVIEWER')`,
      }),
      this.createIndex({
        schema: 'public',
        table: 'Feedback',
        index: 'Feedback_reviewerId_createdAt_idx_448c968e',
        columns: ['reviewerId', 'createdAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Feedback',
        index: 'Feedback_reviewerId_idx_25a27b4e',
        columns: ['reviewerId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Feedback',
        foreignKey: {
          name: 'Feedback_submissionId_fkey',
          columns: ['submissionId'],
          references: { schema: 'public', table: 'Submission', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Feedback',
        foreignKey: {
          name: 'Feedback_reviewerId_fkey',
          columns: ['reviewerId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);

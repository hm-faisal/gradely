#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/c483accf0de0f0be13e33e8533dc6a0a8a2a70eae5db6844f4651713214d621b/contract';
import endContract from '../../snapshots/c483accf0de0f0be13e33e8533dc6a0a8a2a70eae5db6844f4651713214d621b/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  checkExpression,
  col,
  fn,
  lit,
  primaryKey,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: 'public' }),
      this.createTable({
        schema: 'public',
        table: 'Submission',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('description', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('feedback', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('liveLink', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('projectName', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('repoUrl', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('reviewedAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
          col('reviewerId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('PENDING'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('studentId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'Submission_status_check_56005a61',
            `"status" IN ('PENDING', 'APPROVED', 'REJECTED')`,
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'User',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('email', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('password', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('role', 'text', {
            notNull: true,
            default: lit('STUDENT'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('status', 'text', {
            notNull: true,
            default: lit('ACTIVE'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression('User_role_check_482f18a5', `"role" IN ('STUDENT', 'ADMIN')`),
          checkExpression(
            'User_status_check_01c3a8a2',
            `"status" IN ('ACTIVE', 'INACTIVE', 'BANNED', 'DELETED')`,
          ),
        ],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Submission',
        constraint: 'Submission_repoUrl_key',
        columns: ['repoUrl'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Submission',
        constraint: 'Submission_studentId_projectName_key',
        columns: ['studentId', 'projectName'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'User',
        constraint: 'User_email_key',
        columns: ['email'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Submission',
        index: 'Submission_reviewerId_idx_25a27b4e',
        columns: ['reviewerId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Submission',
        index: 'Submission_status_createdAt_idx_58610442',
        columns: ['status', 'createdAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Submission',
        index: 'Submission_studentId_idx_bf255322',
        columns: ['studentId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Submission',
        foreignKey: {
          name: 'Submission_studentId_fkey',
          columns: ['studentId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Submission',
        foreignKey: {
          name: 'Submission_reviewerId_fkey',
          columns: ['reviewerId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);

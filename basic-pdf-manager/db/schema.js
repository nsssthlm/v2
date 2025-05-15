const { pgTable, serial, text, timestamp, varchar, integer } = require('drizzle-orm/pg-core');

// Tabell för mappar - så PDF-dokument kan organiseras hierarkiskt
const folders = pgTable('folders', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  parentId: integer('parent_id').references(() => folders.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdBy: varchar('created_by', { length: 255 }).notNull()
});

// Tabell för PDF-dokument med unika ID
const pdfDocuments = pgTable('pdf_documents', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  originalFilename: varchar('original_filename', { length: 255 }).notNull(),
  storedFilename: varchar('stored_filename', { length: 255 }).notNull(), // Filnamnet på disk
  fileSize: integer('file_size').notNull(),
  folderId: integer('folder_id').references(() => folders.id), // Foreign key till mappen
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdBy: varchar('created_by', { length: 255 }).notNull()
});

// Tabell för versioner av PDF-dokument - om samma dokument laddas upp flera gånger
const pdfVersions = pgTable('pdf_versions', {
  id: serial('id').primaryKey(),
  pdfId: integer('pdf_id').references(() => pdfDocuments.id).notNull(),
  versionNumber: integer('version_number').notNull(),
  storedFilename: varchar('stored_filename', { length: 255 }).notNull(),
  fileSize: integer('file_size').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  createdBy: varchar('created_by', { length: 255 }).notNull()
});

// Tabell för metadata kopplat till PDF-dokument
const pdfMetadata = pgTable('pdf_metadata', {
  id: serial('id').primaryKey(),
  pdfId: integer('pdf_id').references(() => pdfDocuments.id).notNull(),
  key: varchar('key', { length: 100 }).notNull(),
  value: text('value'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

module.exports = {
  folders,
  pdfDocuments,
  pdfVersions,
  pdfMetadata
};
import { TextDocument } from 'vscode-languageserver-textdocument';
import { BaseValidator } from './baseValidator';
import { parse, ASTNode } from 'graphql';
import { gqlPluckFromCodeStringSync } from '@graphql-tools/graphql-tag-pluck';

import { DiagnosticSection } from './baseValidator';
export class GraphQLValidator extends BaseValidator<ASTNode> {
    getLanguageId(): string {
        return 'javascript';
    }

    prepareDiagnosticTargets(
        textDocument: TextDocument
    ): DiagnosticSection<ASTNode>[] {
        const gqlSources = gqlPluckFromCodeStringSync(
            textDocument.uri,
            textDocument.getText(),
            {
                skipIndent: true,
                globalGqlIdentifierName: ['gql', 'graphql']
            }
        );

        const results: DiagnosticSection<ASTNode>[] = [];
        for (const source of gqlSources) {
            try {
                const { line, column } = source.locationOffset;
                const gqlTextDocument = TextDocument.create(
                    ``,
                    'graphql',
                    1,
                    source.body
                );

                const astNode = parse(source.body);

                const section = {
                    data: astNode,
                    document: gqlTextDocument,
                    lineOffset: line - 1,
                    columnOffset: column + 1
                } satisfies DiagnosticSection<ASTNode>;
                results.push(section);
            } catch (e) {
                console.log('Unable to parse GQL document.');
            }
        }
        return results;
    }
}

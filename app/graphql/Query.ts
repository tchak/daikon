import { Resolver, FieldResolver, Arg, Root, ID, Query } from 'type-graphql';
import * as TE from 'fp-ts/TaskEither';
import { identity, pipe, constNull } from 'fp-ts/function';

import {
  findGraphs,
  findGraph,
  findVersion,
  findView,
  findVersionEdges,
  findVersionBlockEdges,
  findViewEdges,
  findGraphVersion,
  findGraphView,
  diff,
  EdgeData,
  VersionData,
  ViewData,
  ChangeData,
  GraphData,
  RowData,
  findVersionRows,
  findGraphRows,
  findGraphVersions,
  findGraphViews,
} from '~/db';

import { Graph } from './Graph';
import { Edge } from './Field';
import { Row } from './Row';
import { Version } from './Version';
import { View } from './View';
import { Change } from './Change';

@Resolver(Graph)
export class GraphResolver {
  @FieldResolver(() => Version)
  version(@Root() root: GraphData): Promise<VersionData> {
    return pipe(findGraphVersion(root.id), throwError())();
  }

  @FieldResolver(() => View)
  view(@Root() root: GraphData): Promise<ViewData> {
    return pipe(findGraphView(root.id), throwError())();
  }

  @FieldResolver(() => [Version])
  versions(@Root() root: GraphData): Promise<VersionData[]> {
    return pipe(
      findGraphVersions(root.id),
      TE.match(constEmptyArray, identity)
    )();
  }

  @FieldResolver(() => [View])
  views(@Root() root: GraphData): Promise<ViewData[]> {
    return pipe(findGraphViews(root.id), TE.match(constEmptyArray, identity))();
  }

  @FieldResolver(() => [Row])
  rows(
    @Root() root: GraphData,
    @Arg('parentFieldId', () => ID, { nullable: true }) parentFieldId: string,
    @Arg('parentId', () => ID, { nullable: true }) parentId: string
  ): Promise<RowData[]> {
    return pipe(
      findGraphRows({ graphId: root.id, parentFieldId, parentId }),
      TE.match(constEmptyArray, identity)
    )();
  }
}

@Resolver(View)
export class ViewResolver {
  @FieldResolver(() => [Edge])
  edges(
    @Root() root: ViewData,
    @Arg('leftId', () => ID, { nullable: true }) leftId?: string
  ): Promise<EdgeData[]> {
    return pipe(findViewEdges({ viewId: root.id }), throwError())();
  }
}

@Resolver(Version)
export class VersionResolver {
  @FieldResolver(() => [Change])
  diff(
    @Root() root: VersionData,
    @Arg('versionId', () => ID) versionId: string
  ): Promise<ChangeData[]> {
    return pipe(
      diff({ leftVersionId: root.id, rightVersionId: versionId }),
      TE.match(constEmptyArray, identity)
    )();
  }

  @FieldResolver(() => [Edge])
  edges(
    @Root() root: VersionData,
    @Arg('leftId', () => ID, { nullable: true }) leftId?: string
  ): Promise<EdgeData[]> {
    return pipe(
      findVersionEdges({ versionId: root.id, leftId }),
      throwError()
    )();
  }

  @FieldResolver(() => [Edge])
  blockEdges(@Root() root: VersionData): Promise<EdgeData[]> {
    return pipe(findVersionBlockEdges({ versionId: root.id }), throwError())();
  }

  @FieldResolver(() => [Row])
  rows(
    @Root() root: VersionData,
    @Arg('parentFieldId', () => ID, { nullable: true }) parentFieldId: string,
    @Arg('parentId', () => ID, { nullable: true }) parentId: string
  ): Promise<RowData[]> {
    return pipe(
      findVersionRows({ versionId: root.id, parentFieldId, parentId }),
      TE.match(constEmptyArray, identity)
    )();
  }
}

@Resolver()
export class QueryResolver {
  @Query(() => [Graph])
  graphs(): Promise<GraphData[]> {
    return pipe(findGraphs(), TE.match(constEmptyArray, identity))();
  }

  @Query(() => Graph, { nullable: true })
  graph(@Arg('graphId', () => ID) graphId: string): Promise<GraphData | null> {
    return pipe(findGraph(graphId), TE.match(constNull, identity))();
  }

  @Query(() => Version, { nullable: true })
  version(
    @Arg('versionId', () => ID) versionId: string
  ): Promise<VersionData | null> {
    return pipe(findVersion(versionId), TE.match(constNull, identity))();
  }

  @Query(() => View, { nullable: true })
  view(@Arg('viewId', () => ID) viewId: string): Promise<ViewData | null> {
    return pipe(findView(viewId), TE.match(constNull, identity))();
  }
}

const constEmptyArray = () => [];

const throwError = <E, A>() =>
  TE.getOrElse<E, A>((error) => {
    throw error;
  });

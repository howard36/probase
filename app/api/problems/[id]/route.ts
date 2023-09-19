import prisma from '@/utils/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  const parts = params.id.split('_');
  let where;
  if (parts[0] === "pid") {
    where = {
      collectionId_pid: {
        collectionId: Number(parts[1]),
        pid: parts[2],
      }
    };
  } else {
    where = { id: Number(parts[1]) };
  }

  const problem = await prisma.problem.findUnique({
    where,
  });
  if (problem === null) {
    return Response.json({}, { status: 404 });
  }
  return Response.json({ problem });
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const parts = params.id.split('_');
  let where;
  if (parts[0] === "pid") {
    where = {
      collectionId_pid: {
        collectionId: Number(parts[1]),
        pid: parts[2],
      }
    };
  } else {
    where = { id: Number(parts[1]) };
  }

  throw new Error("unimplemented");

  const problem = await prisma.problem.findUnique({
    where,
  });
  if (problem === null) {
    return Response.json({}, { status: 404 });
  }
  return Response.json({ problem });
}
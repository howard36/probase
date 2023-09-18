import prisma from '@/utils/prisma'
 
export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  const { searchParams } = new URL(request.url);

  let where;
  if (searchParams.has("cid")) {
    where = { cid: params.id };
  } else {
    where = { id: Number(params.id) };
  }

  const collection = await prisma.collection.findUnique({
    where,
  });
  if (collection === null) {
    return Response.json({}, { status: 404 });
  }
  return Response.json({ collection });
}
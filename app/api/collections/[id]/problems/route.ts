import prisma from '@/utils/prisma'
 
export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  // const { searchParams } = new URL(request.url);
  const collectionId = Number(params.id);
  const problems = await prisma.problem.findMany({
    where: { collectionId },
    orderBy: {
      id: "desc"
    },
  });
  return Response.json({ problems });
}
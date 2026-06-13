import { NextRequest, NextResponse } from "next/server";
import { NotionAPI } from "notion-client";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const notion = new NotionAPI();
const PAGE_ID = "3166d79fd1ad813286abf9aba88d4638";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const name = searchParams.get("name");

  if (!name) {
    return NextResponse.json({ error: "이름을 입력해주세요." }, { status: 400 });
  }

  try {
    // 1. Fetch the public Notion page using the unofficial client (no API key needed)
    const pageData = await notion.getPage(PAGE_ID);
    const blocks = Object.values(pageData.block).map((b: any) => b.value?.value);

    // 2. Extract and search text from the page blocks
    let matchedLines: string[] = [];
    for (const block of blocks) {
      if (block?.properties?.title) {
        let blockText = "";
        for (const segment of block.properties.title) {
          if (segment[0]) {
            blockText += segment[0];
          }
        }
        
        const searchTarget = name.toLowerCase().replace(/\s+/g, "");
        const blockTextTarget = blockText.toLowerCase().replace(/\s+/g, "");
        
        if (blockTextTarget.includes(searchTarget)) {
          matchedLines.push(blockText);
        }
      }
    }

    const exists = matchedLines.length > 0;

    return NextResponse.json({ exists, name, matchedLines });
  } catch (error: any) {
    console.error("Notion Page Fetch Error:", error.message);
    return NextResponse.json(
      { error: "노션 데이터를 가져오지 못했습니다. 페이지가 삭제되었거나 접근할 수 없습니다." },
      { status: 500 }
    );
  }
}

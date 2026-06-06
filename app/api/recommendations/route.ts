import { NextResponse } from "next/server";
import { defaultContext, defaultWeights, mockProducts } from "@/lib/mock-data";
import { generateRecommendations } from "@/lib/recommendation-engine";

export async function GET() {
  return NextResponse.json({
    products: mockProducts,
    context: defaultContext,
    weights: defaultWeights,
    recommendations: generateRecommendations(mockProducts, defaultContext, defaultWeights, 0.15)
  });
}

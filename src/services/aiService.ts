import type { ContractAnalysis, RiskItem, ContractComparison, Difference, Suggestion, GapAnalysis, RealitySituation } from '../types';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

interface AIServiceConfig {
    provider: 'openai' | 'gemini';
    apiKey: string;
}

class AIService {
    private config: AIServiceConfig | null = null;

    setConfig(config: AIServiceConfig) {
        this.config = config;
    }

    private async callGemini(prompt: string): Promise<string> {
        if (!this.config?.apiKey) {
            throw new Error('API key chưa được cấu hình. Vui lòng vào Cài đặt để nhập API key.');
        }

        const response = await fetch(`${GEMINI_API_URL}?key=${this.config.apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 8192,
                },
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Lỗi khi gọi API');
        }

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    }

    private async callOpenAI(prompt: string): Promise<string> {
        if (!this.config?.apiKey) {
            throw new Error('API key chưa được cấu hình. Vui lòng vào Cài đặt để nhập API key.');
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.config.apiKey}`,
            },
            body: JSON.stringify({
                model: 'gpt-5-nano',
                messages: [{ role: 'user', content: prompt }],
                // temperature: 0.7,
                // max_tokens: 4096,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Lỗi khi gọi API');
        }

        const data = await response.json();
        return data.choices?.[0]?.message?.content || '';
    }

    private async callAI(prompt: string): Promise<string> {
        if (!this.config) {
            throw new Error('AI service chưa được cấu hình');
        }

        if (this.config.provider === 'gemini') {
            return this.callGemini(prompt);
        } else {
            return this.callOpenAI(prompt);
        }
    }

    async analyzeContract(contractText: string): Promise<ContractAnalysis> {
        const prompt = `Bạn là Luật sư cao cấp chuyên trách rà soát hợp đồng. 
Hãy phân tích hợp đồng dưới đây và trích xuất dữ liệu chính xác vào định dạng JSON.

NHIỆM VỤ CỤ THỂ:
1. Xác định các rủi ro tiềm ẩn (bất lợi về phạt vi phạm, đơn phương chấm dứt, hoặc câu từ mơ hồ).
2. Trích xuất các mốc thời gian quan trọng.
3. Tóm tắt nghĩa vụ trọng yếu của từng bên.

HỢP ĐỒNG:
${contractText}

Trả về JSON với cấu trúc sau (không có markdown, chỉ JSON thuần):
{
  "summary": "Tóm tắt ngắn gọn về hợp đồng (2-3 câu)",
  "keyTerms": [
    {"term": "Tên điều khoản", "definition": "Giải thích", "section": "Điều X"}
  ],
  "importantDates": [
    {"date": "YYYY-MM-DD hoặc mô tả", "description": "Mô tả", "type": "start|end|deadline|renewal|other"}
  ],
  "obligations": [
    {"party": "Bên A/Bên B", "description": "Nghĩa vụ", "priority": "high|medium|low"}
  ],
  "risks": [
    {
      "id": "risk_1",
      "title": "Tên rủi ro ngắn gọn",
      "description": "Phân tích sâu tại sao điều khoản này gây bất lợi",
      "severity": "critical|high|medium|low",
      "category": "liability|termination|penalty|hidden_cost|ambiguity|compliance|other",
      "suggestion": "Đề xuất sửa đổi cụ thể",
      "section": "Điều khoản liên quan (VD: Điều 5.1)",
      "quote": "Trích dẫn nguyên văn đoạn văn bản gây rủi ro",
      "scenarios": ["Ví dụ thực tế 1", "Ví dụ thực tế 2"],
      "legalReferences": [
        { "title": "Tên văn bản (VD: Bộ luật Dân sự 2015, Điều 401)", "url": "Link đến văn bản pháp luật uy tín" }
      ]
    }
  ]
}

CHÚ Ý: Ở phần "risks", bạn hãy thực hiện "Stress-test" hợp đồng để tìm ra các bẫy pháp lý, điều khoản mâu thuẫn hoặc bất lợi tiềm ẩn dựa trên pháp luật Việt Nam hiện hành.`;

        const response = await this.callAI(prompt);

        try {
            // Clean up response - remove markdown code blocks if present
            let cleanResponse = response.trim();
            if (cleanResponse.startsWith('```json')) {
                cleanResponse = cleanResponse.slice(7);
            }
            if (cleanResponse.startsWith('```')) {
                cleanResponse = cleanResponse.slice(3);
            }
            if (cleanResponse.endsWith('```')) {
                cleanResponse = cleanResponse.slice(0, -3);
            }

            const analysis = JSON.parse(cleanResponse.trim());
            return {
                ...analysis,
                analyzedAt: new Date().toISOString(),
            };
        } catch {
            // If JSON parsing fails, create a basic analysis
            return {
                summary: response.slice(0, 500),
                keyTerms: [],
                importantDates: [],
                obligations: [],
                risks: [],
                analyzedAt: new Date().toISOString(),
            };
        }
    }

    async detectRisks(contractText: string): Promise<RiskItem[]> {
        const prompt = `Bạn là một Luật sư tranh tụng sắc sảo. Hãy thực hiện "Stress-test" hợp đồng này để tìm ra các bẫy pháp lý và rủi ro tiềm ẩn dựa trên pháp luật Việt Nam hiện hành.

HỢP ĐỒNG:
${contractText}

YÊU CẦU:
Với mỗi rủi ro tìm thấy, bạn phải phân tích cực kỳ chi tiết theo định dạng JSON bên dưới.
1. "description": Phân tích sâu tại sao điều khoản này gây bất lợi.
2. "scenarios": Đưa ra ít nhất 1 ví dụ cụ thể về tình huống thực tế mà rủi ro này sẽ gây thiệt hại cho người dùng.
3. "legal_reference": Chỉ rõ điều khoản này có khả năng vi phạm hoặc mâu thuẫn với luật mới nhất nào.

Trả về JSON array với cấu trúc sau (không có markdown, chỉ JSON thuần):
[
  {
    "id": "risk_1",
    "title": "Tên rủi ro ngắn gọn",
    "description": "Mô tả chi tiết rủi ro và tác động",
    "severity": "critical|high|medium|low",
    "category": "liability|termination|penalty|hidden_cost|ambiguity|compliance|other",
    "suggestion": "Đề xuất sửa đổi cụ thể",
    "section": "Điều khoản liên quan (VD: Điều 5.1)",
    "quote": "Trích dẫn nguyên văn đoạn văn bản gây rủi ro trong hợp đồng",
    "scenarios": ["Ví dụ thực tế 1", "Ví dụ thực tế 2"],
    "legalReferences": [
      { "title": "Tên văn bản (VD: Bộ luật Dân sự 2015, Điều 401)", "url": "Link đến văn bản trên thuvienphapluat.vn hoặc link uy tín khác" }
    ]
  }
]

Chú ý phát hiện:
- Điều khoản bất lợi cho một bên
- Phạt vi phạm quá cao
- Giới hạn trách nhiệm không hợp lý
- Điều khoản chấm dứt có lợi cho một bên
- Chi phí ẩn
- Điều khoản mơ hồ, thiếu rõ ràng
- Vi phạm quy định pháp luật`;

        const response = await this.callAI(prompt);

        try {
            let cleanResponse = response.trim();
            if (cleanResponse.startsWith('```json')) {
                cleanResponse = cleanResponse.slice(7);
            }
            if (cleanResponse.startsWith('```')) {
                cleanResponse = cleanResponse.slice(3);
            }
            if (cleanResponse.endsWith('```')) {
                cleanResponse = cleanResponse.slice(0, -3);
            }

            return JSON.parse(cleanResponse.trim());
        } catch {
            return [];
        }
    }

    async compareContracts(contract1: string, contract2: string): Promise<ContractComparison> {
        const prompt = `Bạn là chuyên gia pháp lý so sánh hợp đồng. Hãy so sánh chi tiết 2 hợp đồng sau:

HỢP ĐỒNG 1:
${contract1}

HỢP ĐỒNG 2:
${contract2}

Trả về JSON với cấu trúc sau (không có markdown, chỉ JSON thuần):
{
  "summary": "Tóm tắt sự khác biệt chính giữa 2 hợp đồng",
  "differences": [
    {
      "aspect": "Khía cạnh so sánh (VD: Thời hạn, Giá trị, Phạt vi phạm...)",
      "contract1Value": "Giá trị trong HĐ1",
      "contract2Value": "Giá trị trong HĐ2",
      "significance": "major|minor",
      "recommendation": "Khuyến nghị chọn phương án nào và tại sao"
    }
  ],
  "recommendations": [
    "Khuyến nghị 1",
    "Khuyến nghị 2"
  ]
}`;

        const response = await this.callAI(prompt);

        try {
            let cleanResponse = response.trim();
            if (cleanResponse.startsWith('```json')) {
                cleanResponse = cleanResponse.slice(7);
            }
            if (cleanResponse.startsWith('```')) {
                cleanResponse = cleanResponse.slice(3);
            }
            if (cleanResponse.endsWith('```')) {
                cleanResponse = cleanResponse.slice(0, -3);
            }

            const result = JSON.parse(cleanResponse.trim());
            return {
                id: crypto.randomUUID(),
                contract1Id: '',
                contract2Id: '',
                differences: result.differences as Difference[],
                summary: result.summary,
                recommendations: result.recommendations,
                comparedAt: new Date().toISOString(),
            };
        } catch {
            return {
                id: crypto.randomUUID(),
                contract1Id: '',
                contract2Id: '',
                differences: [],
                summary: 'Không thể phân tích so sánh',
                recommendations: [],
                comparedAt: new Date().toISOString(),
            };
        }
    }

    async chatWithContract(contractText: string, question: string, history: string[] = []): Promise<{ answer: string; citations: string[] }> {
        const historyText = history.length > 0
            ? `\nLịch sử hội thoại:\n${history.join('\n')}\n`
            : '';

        const prompt = `Bạn là trợ lý pháp lý AI giúp giải đáp thắc mắc về hợp đồng. Hãy trả lời câu hỏi dựa trên nội dung hợp đồng được cung cấp.

HỢP ĐỒNG:
${contractText}
${historyText}
CÂU HỎI: ${question}

Hãy trả lời bằng tiếng Việt, rõ ràng và chính xác. Nếu câu hỏi liên quan đến điều khoản cụ thể, hãy trích dẫn phần liên quan. Nếu không tìm thấy thông tin trong hợp đồng, hãy nói rõ điều đó.

Trả về JSON với cấu trúc (không có markdown, chỉ JSON thuần):
{
  "answer": "Câu trả lời chi tiết",
  "citations": ["Trích dẫn 1 từ hợp đồng", "Trích dẫn 2 nếu có"]
}`;

        const response = await this.callAI(prompt);

        try {
            let cleanResponse = response.trim();
            if (cleanResponse.startsWith('```json')) {
                cleanResponse = cleanResponse.slice(7);
            }
            if (cleanResponse.startsWith('```')) {
                cleanResponse = cleanResponse.slice(3);
            }
            if (cleanResponse.endsWith('```')) {
                cleanResponse = cleanResponse.slice(0, -3);
            }

            return JSON.parse(cleanResponse.trim());
        } catch {
            return {
                answer: response,
                citations: [],
            };
        }
    }

    async compareWithReality(contractText: string, situation: RealitySituation): Promise<{ gaps: GapAnalysis[]; suggestions: Suggestion[] }> {
        const issuesText = situation.issues.map((issue, i) =>
            `${i + 1}. Điều khoản: ${issue.clause}\n   Tình trạng thực tế: ${issue.currentSituation}\n   Khoảng cách: ${issue.gap}`
        ).join('\n');

        const prompt = `Bạn là chuyên gia pháp lý phân tích khoảng cách giữa hợp đồng và thực tế. Hãy phân tích tình huống sau:

HỢP ĐỒNG:
${contractText}

MÔ TẢ TÌNH TRẠNG THỰC TẾ:
${situation.description}

CÁC VẤN ĐỀ PHÁT HIỆN:
${issuesText}

Trả về JSON với cấu trúc (không có markdown, chỉ JSON thuần):
{
  "gaps": [
    {
      "clause": "Điều khoản liên quan",
      "expected": "Nội dung theo hợp đồng",
      "actual": "Tình trạng thực tế",
      "severity": "critical|high|medium|low"
    }
  ],
  "suggestions": [
    {
      "issue": "Vấn đề cần giải quyết",
      "suggestion": "Đề xuất cách giải quyết chi tiết",
      "legalBasis": "Căn cứ pháp lý (nếu có)",
      "priority": "high|medium|low"
    }
  ]
}`;

        const response = await this.callAI(prompt);

        try {
            let cleanResponse = response.trim();
            if (cleanResponse.startsWith('```json')) {
                cleanResponse = cleanResponse.slice(7);
            }
            if (cleanResponse.startsWith('```')) {
                cleanResponse = cleanResponse.slice(3);
            }
            if (cleanResponse.endsWith('```')) {
                cleanResponse = cleanResponse.slice(0, -3);
            }

            return JSON.parse(cleanResponse.trim());
        } catch {
            return {
                gaps: [],
                suggestions: [],
            };
        }
    }

    async categorizeContract(contractText: string): Promise<{ category: string; confidence: number }> {
        const prompt = `Phân loại hợp đồng sau vào một trong các danh mục:
- labor: Hợp đồng lao động
- sales: Hợp đồng mua bán
- rental: Hợp đồng thuê/cho thuê
- service: Hợp đồng dịch vụ
- partnership: Hợp đồng hợp tác kinh doanh
- other: Khác

HỢP ĐỒNG:
${contractText.slice(0, 2000)}

Trả về JSON (không có markdown):
{"category": "category_code", "confidence": 0.0-1.0}`;

        const response = await this.callAI(prompt);

        try {
            let cleanResponse = response.trim();
            if (cleanResponse.startsWith('```json')) {
                cleanResponse = cleanResponse.slice(7);
            }
            if (cleanResponse.startsWith('```')) {
                cleanResponse = cleanResponse.slice(3);
            }
            if (cleanResponse.endsWith('```')) {
                cleanResponse = cleanResponse.slice(0, -3);
            }

            return JSON.parse(cleanResponse.trim());
        } catch {
            return { category: 'other', confidence: 0.5 };
        }
    }
}

export const aiService = new AIService();

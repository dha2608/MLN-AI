import { Book, Scale, Coins, Globe, History, Users, Award, BookOpen, Star, Zap, Anchor, Target, Layers, Box, Cpu } from 'lucide-react';

export interface LibraryItem {
  id: string;
  title: string;
  desc: string;
  content?: string; // Detailed content (Markdown supported)
  author?: string;
  year?: string;
  image?: string; // New: Image URL
}

export interface LibraryCategory {
  id: string;
  title: string;
  icon: any;
  color: string;
  type: 'concept' | 'book' | 'figure';
  items: LibraryItem[];
}

export const LIBRARY_DATA: LibraryCategory[] = [
    // --- CONCEPTS ---
    {
        id: 'dvbc',
        title: 'Chủ nghĩa duy vật biện chứng',
        icon: Book,
        color: 'from-red-500 to-red-700',
        type: 'concept',
        items: [
            { 
                id: 'c1', 
                title: 'Vật chất và Ý thức', 
                desc: 'Mối quan hệ biện chứng giữa vật chất và ý thức.',
                image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Brain_parts.jpg/640px-Brain_parts.jpg', // Brain/Consciousness
                content: `
### 1. Phạm trù Vật chất
- **Định nghĩa của Lênin**: "Vật chất là một phạm trù triết học dùng để chỉ thực tại khách quan được đem lại cho con người trong cảm giác, được cảm giác của chúng ta chép lại, chụp lại, phản ánh, và tồn tại không lệ thuộc vào cảm giác."
- **Ý nghĩa**: Khẳng định vật chất có trước, ý thức có sau; vật chất là nguồn gốc khách quan của cảm giác, ý thức.

### 2. Nguồn gốc và Bản chất của Ý thức
- **Nguồn gốc tự nhiên**: Bộ óc người và thế giới khách quan.
- **Nguồn gốc xã hội**: Lao động và ngôn ngữ.
- **Bản chất**: Ý thức là hình ảnh chủ quan của thế giới khách quan; là sự phản ánh tích cực, tự giác, sáng tạo thế giới khách quan vào trong bộ óc con người.

### 3. Mối quan hệ biện chứng
- **Vật chất quyết định ý thức**: Quyết định nguồn gốc, nội dung, hình thức biểu hiện và sự vận động, phát triển của ý thức.
- **Ý thức tác động trở lại vật chất**: Thông qua hoạt động thực tiễn của con người. Ý thức đúng đắn thúc đẩy sự phát triển; ý thức sai lệch kìm hãm sự phát triển.
                `
            },
            { 
                id: 'c2', 
                title: 'Hai nguyên lý', 
                desc: 'Nguyên lý về mối liên hệ phổ biến và Nguyên lý về sự phát triển.',
                image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Pangaea_continents.png/640px-Pangaea_continents.png', // Connection
                content: `
### 1. Nguyên lý về mối liên hệ phổ biến
- **Khái niệm**: Các sự vật, hiện tượng trong thế giới không tồn tại cô lập, biệt lập mà nằm trong một chỉnh thể thống nhất, có mối liên hệ, tác động qua lại, ràng buộc lẫn nhau.
- **Tính chất**: Tính khách quan, tính phổ biến, tính đa dạng phong phú.
- **Ý nghĩa phương pháp luận**: Quan điểm toàn diện và quan điểm lịch sử - cụ thể.

### 2. Nguyên lý về sự phát triển
- **Khái niệm**: Phát triển là quá trình vận động từ thấp đến cao, từ đơn giản đến phức tạp, từ kém hoàn thiện đến hoàn thiện hơn.
- **Tính chất**: Tính khách quan, tính phổ biến, tính đa dạng phong phú, tính kế thừa.
- **Ý nghĩa phương pháp luận**: Quan điểm phát triển.
                `
            },
            { 
                id: 'c3', 
                title: 'Ba quy luật cơ bản', 
                desc: 'Lượng - Chất, Mâu thuẫn, Phủ định của phủ định.',
                image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Water_boiling_in_a_pan.jpg/640px-Water_boiling_in_a_pan.jpg', // Boiling water (Quantity to Quality)
                content: `
### 1. Quy luật chuyển hóa từ những sự thay đổi về lượng thành những sự thay đổi về chất và ngược lại
- Chỉ ra cách thức của sự vận động và phát triển.
- Tích lũy về lượng đến một giới hạn nhất định (độ) sẽ dẫn đến sự thay đổi về chất (bước nhảy).

### 2. Quy luật thống nhất và đấu tranh của các mặt đối lập (Quy luật mâu thuẫn)
- Chỉ ra nguồn gốc và động lực của sự phát triển.
- Mâu thuẫn là hiện tượng khách quan và phổ biến. Sự đấu tranh giữa các mặt đối lập dẫn đến sự phát triển.

### 3. Quy luật phủ định của phủ định
- Chỉ ra khuynh hướng của sự phát triển (theo hình xoắn ốc).
- Cái mới ra đời phủ định cái cũ, nhưng kế thừa những yếu tố tích cực của cái cũ.
                `
            },
            { 
                id: 'c4', 
                title: 'Sáu cặp phạm trù', 
                desc: 'Các cặp phạm trù cơ bản của phép biện chứng duy vật.',
                image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Duality_example.svg/640px-Duality_example.svg.png', // Duality
                content: `
1. **Cái riêng và Cái chung**: Cái chung chỉ tồn tại trong cái riêng, thông qua cái riêng. Cái riêng chỉ tồn tại trong mối liên hệ đưa đến cái chung.
2. **Nguyên nhân và Kết quả**: Nguyên nhân sinh ra kết quả. Một nguyên nhân có thể sinh ra nhiều kết quả và ngược lại.
3. **Tất nhiên và Ngẫu nhiên**: Tất nhiên vạch đường đi cho mình thông qua vô số cái ngẫu nhiên.
4. **Nội dung và Hình thức**: Nội dung quyết định hình thức, hình thức tác động trở lại nội dung.
5. **Bản chất và Hiện tượng**: Bản chất bộc lộ qua hiện tượng, hiện tượng là biểu hiện của bản chất.
6. **Khả năng và Hiện thực**: Khả năng là cái chưa xảy ra nhưng sẽ xảy ra khi có điều kiện thích hợp. Hiện thực là cái đang tồn tại.
                ` 
            },
            {
                id: 'c14',
                title: 'Lý luận nhận thức',
                desc: 'Con đường biện chứng của sự nhận thức chân lý.',
                image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Sense_data_pathway.svg/640px-Sense_data_pathway.svg.png',
                content: `
### Con đường biện chứng của sự nhận thức
"Từ trực quan sinh động đến tư duy trừu tượng, và từ tư duy trừu tượng đến thực tiễn - đó là con đường biện chứng của sự nhận thức chân lý, của sự nhận thức thực tại khách quan." (V.I.Lênin)

1. **Nhận thức cảm tính (Trực quan sinh động)**: Cảm giác, tri giác, biểu tượng.
2. **Nhận thức lý tính (Tư duy trừu tượng)**: Khái niệm, phán đoán, suy lý.
3. **Thực tiễn**: Là cơ sở, động lực, mục đích của nhận thức và là tiêu chuẩn của chân lý.
                `
            }
        ]
    },
    {
        id: 'dvls',
        title: 'Chủ nghĩa duy vật lịch sử',
        icon: History,
        color: 'from-amber-500 to-amber-700',
        type: 'concept',
        items: [
            { 
                id: 'c5', 
                title: 'Hình thái Kinh tế - Xã hội', 
                desc: 'Học thuyết về hình thái kinh tế - xã hội.', 
                image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Pyramid_of_Capitalist_System.jpg/640px-Pyramid_of_Capitalist_System.jpg',
                content: `
### 1. Khái niệm
Hình thái kinh tế - xã hội là một phạm trù của chủ nghĩa duy vật lịch sử dùng để chỉ xã hội ở từng giai đoạn lịch sử nhất định, với một kiểu quan hệ sản xuất đặc trưng cho xã hội đó phù hợp với một trình độ nhất định của lực lượng sản xuất và với một kiến trúc thượng tầng tương ứng được xây dựng trên những quan hệ sản xuất ấy.

### 2. Cấu trúc
- **Lực lượng sản xuất**: Nền tảng vật chất - kỹ thuật của xã hội.
- **Quan hệ sản xuất**: Quan hệ kinh tế cơ bản, đóng vai trò là cơ sở hạ tầng.
- **Kiến trúc thượng tầng**: Hệ thống quan điểm chính trị, pháp quyền, triết học, đạo đức, tôn giáo, nghệ thuật... cùng với các thiết chế xã hội tương ứng.

### 3. Sự vận động
Sự vận động, thay thế của các hình thái kinh tế - xã hội là một quá trình lịch sử - tự nhiên.
                ` 
            },
            { 
                id: 'c6', 
                title: 'Cơ sở hạ tầng & Kiến trúc thượng tầng', 
                desc: 'Mối quan hệ biện chứng giữa kinh tế và chính trị.', 
                image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Reichstag_building_Berlin_view_from_west_before_sunset.jpg/640px-Reichstag_building_Berlin_view_from_west_before_sunset.jpg',
                content: `
### 1. Cơ sở hạ tầng
Là toàn bộ những quan hệ sản xuất của một xã hội trong sự vận động hiện thực của chúng hợp thành cơ cấu kinh tế của xã hội đó.

### 2. Kiến trúc thượng tầng
Là toàn bộ những quan điểm, tư tưởng xã hội với những thiết chế xã hội tương ứng cùng những quan hệ nội tại của thượng tầng hình thành trên một cơ sở hạ tầng nhất định.

### 3. Mối quan hệ biện chứng
- **Cơ sở hạ tầng quyết định kiến trúc thượng tầng**: Cơ sở hạ tầng nào thì sinh ra kiến trúc thượng tầng ấy. Khi cơ sở hạ tầng thay đổi thì sớm muộn gì kiến trúc thượng tầng cũng thay đổi theo.
- **Kiến trúc thượng tầng tác động trở lại cơ sở hạ tầng**: Nó có thể thúc đẩy hoặc kìm hãm sự phát triển của cơ sở hạ tầng. Tuy nhiên, sự tác động này không làm thay đổi được xu hướng vận động tất yếu của cơ sở hạ tầng.
                ` 
            },
            { 
                id: 'c7', 
                title: 'Giai cấp và Đấu tranh giai cấp', 
                desc: 'Động lực phát triển của xã hội có giai cấp.', 
                image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Eug%C3%A8ne_Delacroix_-_La_libert%C3%A9_guidant_le_peuple.jpg/640px-Eug%C3%A8ne_Delacroix_-_La_libert%C3%A9_guidant_le_peuple.jpg',
                content: `
### 1. Định nghĩa Giai cấp (Lênin)
"Người ta gọi là giai cấp, những tập đoàn to lớn gồm những người khác nhau về địa vị của họ trong một hệ thống sản xuất xã hội nhất định trong lịch sử, khác nhau về quan hệ của họ (thường thường thì những quan hệ này được pháp luật quy định và thừa nhận) đối với những tư liệu sản xuất, về vai trò của họ trong tổ chức lao động xã hội, và như vậy là khác nhau về cách thức hưởng thụ và về phần của cải xã hội ít hay nhiều mà họ được hưởng."

### 2. Nguồn gốc giai cấp
- Nguồn gốc sâu xa: Sự phát triển của lực lượng sản xuất.
- Nguồn gốc trực tiếp: Chế độ tư hữu về tư liệu sản xuất.

### 3. Đấu tranh giai cấp
Là cuộc đấu tranh giữa các giai cấp có lợi ích căn bản đối lập nhau. Trong xã hội có giai cấp, đấu tranh giai cấp là động lực trực tiếp của sự phát triển lịch sử.
                ` 
            },
            {
                id: 'c15',
                title: 'Nhà nước',
                desc: 'Nguồn gốc, bản chất và chức năng của nhà nước.',
                image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Leviathan_by_Thomas_Hobbes.jpg/640px-Leviathan_by_Thomas_Hobbes.jpg',
                content: `
### 1. Nguồn gốc
Nhà nước là sản phẩm và biểu hiện của những mâu thuẫn giai cấp không thể điều hòa được.

### 2. Bản chất
Nhà nước là bộ máy dùng để duy trì sự thống trị của giai cấp này đối với giai cấp khác; là công cụ bạo lực đặc biệt.

### 3. Đặc trưng cơ bản
- Quản lý dân cư theo lãnh thổ.
- Có hệ thống các cơ quan quyền lực chuyên nghiệp mang tính cưỡng chế (quân đội, cảnh sát, nhà tù...).
- Có hệ thống thuế khóa.
                `
            }
        ]
    },
    {
        id: 'ktct',
        title: 'Kinh tế chính trị Mác - Lênin',
        icon: Coins,
        color: 'from-yellow-600 to-yellow-800',
        type: 'concept',
        items: [
            { 
                id: 'c8', 
                title: 'Hàng hóa & Tiền tệ', 
                desc: 'Hai thuộc tính của hàng hóa.', 
                image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Gold_Coins.jpg/640px-Gold_Coins.jpg',
                content: `
### 1. Hàng hóa
Là sản phẩm của lao động, có thể thỏa mãn nhu cầu nào đó của con người thông qua trao đổi, mua bán.
- **Hai thuộc tính**:
    - **Giá trị sử dụng**: Công dụng của vật phẩm.
    - **Giá trị**: Lao động xã hội của người sản xuất hàng hóa kết tinh trong hàng hóa.

### 2. Tiền tệ
Là hàng hóa đặc biệt được tách ra làm vật ngang giá chung cho tất cả các hàng hóa khác.
- **Nguồn gốc**: Ra đời từ sự phát triển của sản xuất và trao đổi hàng hóa.
- **Bản chất**: Thể hiện quan hệ sản xuất xã hội.
- **Chức năng**: Thước đo giá trị, phương tiện lưu thông, phương tiện cất trữ, phương tiện thanh toán, tiền tệ thế giới.
                ` 
            },
            { 
                id: 'c9', 
                title: 'Quy luật giá trị', 
                desc: 'Quy luật kinh tế cơ bản.', 
                image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Supply_and_demand_graph.svg/640px-Supply_and_demand_graph.svg.png', // Corrected Image
                content: `
### Nội dung quy luật
Sản xuất và trao đổi hàng hóa phải dựa trên cơ sở hao phí lao động xã hội cần thiết.
- Trong sản xuất: Hao phí lao động cá biệt phải phù hợp với hao phí lao động xã hội cần thiết.
- Trong trao đổi: Phải thực hiện theo nguyên tắc ngang giá.

### Tác động của quy luật giá trị
1. Điều tiết sản xuất và lưu thông hàng hóa.
2. Kích thích cải tiến kỹ thuật, hợp lý hóa sản xuất, tăng năng suất lao động.
3. Phân hóa những người sản xuất hàng hóa thành người giàu, người nghèo.
                ` 
            },
            { 
                id: 'c10', 
                title: 'Học thuyết Giá trị thặng dư', 
                desc: 'Bí mật của bóc lột tư bản.', 
                image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Industrial_Revolution_Machine.jpg/640px-Industrial_Revolution_Machine.jpg',
                content: `
### 1. Khái niệm
Giá trị thặng dư (m) là một bộ phận của giá trị mới dôi ra ngoài giá trị sức lao động do công nhân làm thuê tạo ra và bị nhà tư bản chiếm đoạt.

### 2. Tư bản bất biến (c) và Tư bản khả biến (v)
- **Tư bản bất biến (c)**: Bộ phận tư bản dùng để mua tư liệu sản xuất, giá trị được bảo toàn và chuyển vào sản phẩm.
- **Tư bản khả biến (v)**: Bộ phận tư bản dùng để mua sức lao động, trong quá trình sản xuất sẽ tạo ra giá trị mới lớn hơn giá trị bản thân nó (v + m).

### 3. Hai phương pháp sản xuất giá trị thặng dư
- **Giá trị thặng dư tuyệt đối**: Kéo dài ngày lao động trong khi thời gian lao động tất yếu không đổi.
- **Giá trị thặng dư tương đối**: Rút ngắn thời gian lao động tất yếu bằng cách nâng cao năng suất lao động xã hội.
                ` 
            },
            {
                id: 'c16',
                title: 'Tích lũy tư bản',
                desc: 'Quy luật chung của tích lũy tư bản chủ nghĩa.',
                image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Bank_of_England_Mellon.jpg/640px-Bank_of_England_Mellon.jpg',
                content: `
### Bản chất
Là quá trình chuyển hóa một phần giá trị thặng dư trở lại thành tư bản.

### Hệ quả của tích lũy tư bản
1. Tích lũy tư bản làm tăng cấu tạo hữu cơ của tư bản (c/v tăng).
2. Tích lũy tư bản làm cho tích tụ và tập trung tư bản ngày càng tăng.
3. Tích lũy tư bản làm cho chênh lệch thu nhập giữa giai cấp tư sản và giai cấp công nhân ngày càng lớn (bần cùng hóa giai cấp vô sản).
                `
            }
        ]
    },
    {
        id: 'cnxh',
        title: 'Chủ nghĩa xã hội khoa học',
        icon: Globe,
        color: 'from-blue-600 to-blue-800',
        type: 'concept',
        items: [
            { 
                id: 'c11', 
                title: 'Sứ mệnh lịch sử của GCCN', 
                desc: 'Giai cấp công nhân là người đào huyệt chôn CNTB.', 
                image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Proletariat.jpg/640px-Proletariat.jpg', // Corrected Image
                content: `
Giai cấp công nhân là giai cấp lãnh đạo cuộc đấu tranh nhằm lật đổ sự thống trị của giai cấp tư sản, xóa bỏ chế độ áp bức bóc lột, xây dựng thành công chủ nghĩa xã hội và chủ nghĩa cộng sản.
- **Đặc điểm**: Là con đẻ của nền đại công nghiệp; đại diện cho phương thức sản xuất tiên tiến; có tính tổ chức, kỷ luật cao; có tinh thần cách mạng triệt để.
- **Điều kiện khách quan**: Do địa vị kinh tế - xã hội quy định.
- **Điều kiện chủ quan**: Sự phát triển về số lượng và chất lượng; sự ra đời của Đảng Cộng sản.
                ` 
            },
            { 
                id: 'c12', 
                title: 'Cách mạng XHCN', 
                desc: 'Thay thế chế độ cũ bằng chế độ mới.', 
                image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Storming_of_the_Winter_Palace.jpg/640px-Storming_of_the_Winter_Palace.jpg',
                content: `
Cách mạng xã hội chủ nghĩa là cuộc cách mạng nhằm thay thế chế độ tư bản chủ nghĩa bằng chế độ xã hội chủ nghĩa, trong đó giai cấp công nhân là người lãnh đạo và cùng với quần chúng nhân dân lao động xây dựng một xã hội công bằng, dân chủ, văn minh.
- **Mục tiêu**: Giải phóng giai cấp công nhân, nhân dân lao động khỏi mọi sự áp bức, bóc lột.
- **Động lực**: Giai cấp công nhân và quần chúng nhân dân lao động.
- **Nội dung**: Trên các lĩnh vực chính trị, kinh tế, văn hóa - tư tưởng.
                ` 
            },
            { 
                id: 'c13', 
                title: 'Thời kỳ quá độ', 
                desc: 'Tính tất yếu của thời kỳ quá độ.', 
                image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Lenin-Trotsky_1920-05-05.jpg/640px-Lenin-Trotsky_1920-05-05.jpg',
                content: `
Thời kỳ quá độ lên chủ nghĩa xã hội là thời kỳ cải biến cách mạng sâu sắc toàn diện các lĩnh vực đời sống xã hội, từ xã hội cũ sang xã hội mới - xã hội chủ nghĩa.
- **Đặc điểm kinh tế**: Tồn tại nền kinh tế nhiều thành phần.
- **Đặc điểm chính trị**: Tồn tại cuộc đấu tranh giai cấp gay go, phức tạp.
- **Đặc điểm văn hóa - xã hội**: Tồn tại đan xen những yếu tố của văn hóa cũ và văn hóa mới.
                ` 
            },
            {
                id: 'c17',
                title: 'Dân chủ XHCN',
                desc: 'Bản chất và đặc trưng của nền dân chủ xã hội chủ nghĩa.',
                image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Flag_of_Vietnam.svg/640px-Flag_of_Vietnam.svg.png',
                content: `
### Bản chất
Là nền dân chủ của tuyệt đại đa số nhân dân lao động, do Đảng Cộng sản lãnh đạo.

### Đặc trưng
1. Dân chủ về chính trị: Quyền lực thuộc về nhân dân.
2. Dân chủ về kinh tế: Dựa trên chế độ công hữu về tư liệu sản xuất chủ yếu.
3. Dân chủ về văn hóa - xã hội: Giải phóng con người, phát triển toàn diện cá nhân.
                `
            }
        ]
    },
    
    // --- CLASSIC WORKS ---
    {
        id: 'books',
        title: 'Tác phẩm kinh điển',
        icon: BookOpen,
        color: 'from-emerald-600 to-emerald-800',
        type: 'book',
        items: [
            { 
                id: 'b1', 
                title: 'Tuyên ngôn của Đảng Cộng sản', 
                author: 'K. Marx & F. Engels', 
                year: '1848',
                desc: 'Cương lĩnh chính trị đầu tiên của phong trào công nhân và các đảng cộng sản.',
                image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Communist_Manifesto_original.jpg/640px-Communist_Manifesto_original.jpg', // Corrected
                content: `
**"Tuyên ngôn của Đảng Cộng sản"** (Manifest der Kommunistischen Partei) là văn kiện cương lĩnh đầu tiên của chủ nghĩa xã hội khoa học, được soạn thảo bởi Karl Marx và Friedrich Engels, công bố lần đầu vào tháng 2 năm 1848.

### Nội dung chính:
1. **Lịch sử đấu tranh giai cấp**: "Lịch sử của tất cả các xã hội tồn tại từ trước đến nay chỉ là lịch sử đấu tranh giai cấp."
2. **Sự sụp đổ tất yếu của CNTB**: Phân tích mâu thuẫn nội tại của chủ nghĩa tư bản và vai trò của giai cấp vô sản.
3. **Mục tiêu của những người Cộng sản**: Xóa bỏ chế độ tư hữu, thiết lập nền sở hữu công cộng.
4. **Khẩu hiệu bất hủ**: "Vô sản tất cả các nước, đoàn kết lại!"
                `
            },
            { 
                id: 'b2', 
                title: 'Tư bản (Das Kapital)', 
                author: 'K. Marx', 
                year: '1867',
                desc: 'Công trình vĩ đại nhất của Marx, phân tích sâu sắc về phương thức sản xuất tư bản chủ nghĩa.',
                image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Das_Kapital_Volume_I_1867.jpg/640px-Das_Kapital_Volume_I_1867.jpg', // Corrected
                content: `
**"Tư bản"** (Das Kapital) là bộ sách đồ sộ về kinh tế chính trị học của Karl Marx. Tập 1 được xuất bản năm 1867.

### Nội dung chính:
- Phân tích hàng hóa và tiền tệ.
- Vạch trần bản chất bóc lột của phương thức sản xuất tư bản chủ nghĩa thông qua lý luận về giá trị thặng dư.
- Chỉ ra quy luật vận động kinh tế của xã hội hiện đại.
- Được coi là "Kinh thánh của giai cấp công nhân".
                `
            },
            { 
                id: 'b3', 
                title: 'Nhà nước và Cách mạng', 
                author: 'V.I. Lenin', 
                year: '1917',
                desc: 'Học thuyết của chủ nghĩa Mác về nhà nước và nhiệm vụ của giai cấp vô sản trong cách mạng.',
                image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/State_and_Revolution.jpg/640px-State_and_Revolution.jpg', // Corrected
                content: `
**"Nhà nước và Cách mạng"** được Lenin viết vào tháng 8 và 9 năm 1917, ngay trước Cách mạng Tháng Mười Nga.

### Nội dung chính:
- Khôi phục học thuyết của Marx và Engels về nhà nước (bị những người cơ hội bóp méo).
- Khẳng định bản chất giai cấp của nhà nước: Nhà nước là công cụ thống trị giai cấp.
- Nhiệm vụ của cách mạng vô sản là phải đập tan bộ máy nhà nước tư sản cũ và thiết lập chuyên chính vô sản.
- Dự báo về sự "tiêu vong" của nhà nước trong xã hội cộng sản chủ nghĩa.
                `
            },
            {
                id: 'b4',
                title: 'Hệ tư tưởng Đức',
                author: 'K. Marx & F. Engels',
                year: '1845',
                desc: 'Tác phẩm đánh dấu sự ra đời của chủ nghĩa duy vật lịch sử.',
                image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/German_Ideology.jpg/640px-German_Ideology.jpg', // Corrected
                content: `
Trong tác phẩm này, Marx và Engels đã trình bày những nguyên lý cơ bản của chủ nghĩa duy vật lịch sử, phê phán triết học duy tâm của Hêghen và Phơ-bách.
                `
            },
            {
                id: 'b5',
                title: 'Làm gì?',
                author: 'V.I. Lenin',
                year: '1902',
                desc: 'Tác phẩm đặt nền móng cho việc xây dựng đảng kiểu mới của giai cấp công nhân.',
                image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Lenin_What_Is_To_Be_Done_1902_front.jpg/640px-Lenin_What_Is_To_Be_Done_1902_front.jpg',
                content: `
Lenin trình bày những nguyên tắc tổ chức của đảng mác-xít, phê phán chủ nghĩa kinh tế và tính tự phát trong phong trào công nhân.
                `
            }
        ]
    },

    // --- FIGURES ---
    {
        id: 'figures',
        title: 'Nhân vật lịch sử',
        icon: Users,
        color: 'from-purple-600 to-purple-800',
        type: 'figure',
        items: [
            { 
                id: 'f1', 
                title: 'Karl Marx (C. Mác)', 
                year: '1818 - 1883',
                desc: 'Nhà tư tưởng vĩ đại, nhà kinh tế chính trị học, nhà lãnh đạo cách mạng của giai cấp công nhân quốc tế.',
                image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Karl_Marx_001.jpg/640px-Karl_Marx_001.jpg',
                content: `
**Karl Marx** (5/5/1818 – 14/3/1883) là nhà triết học, kinh tế học, sử học, xã hội học, nhà lý luận chính trị, nhà báo và nhà cách mạng người Đức gốc Do Thái.

### Đóng góp chính:
- Sáng lập Chủ nghĩa duy vật lịch sử.
- Phát hiện ra quy luật giá trị thặng dư.
- Cùng với Engels sáng lập ra Chủ nghĩa xã hội khoa học.
- Tác giả của "Tuyên ngôn Đảng Cộng sản" và bộ "Tư bản".
                `
            },
            { 
                id: 'f2', 
                title: 'Friedrich Engels (Ph. Ăng-ghen)', 
                year: '1820 - 1895',
                desc: 'Người bạn chiến đấu vĩ đại của Marx, đồng sáng lập chủ nghĩa Mác.',
                image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Friedrich_Engels_portrait_%28cropped%29.jpg/640px-Friedrich_Engels_portrait_%28cropped%29.jpg',
                content: `
**Friedrich Engels** (28/11/1820 – 5/8/1895) là nhà triết học, nhà khoa học xã hội, nhà báo và nhà cách mạng người Đức.

### Đóng góp chính:
- Cùng với Marx xây dựng nên lý luận chủ nghĩa Mác.
- Tác giả của nhiều tác phẩm quan trọng: "Biện chứng của tự nhiên", "Chống Đuy-rinh", "Nguồn gốc của gia đình, của chế độ tư hữu và của nhà nước".
- Lãnh đạo phong trào công nhân quốc tế sau khi Marx qua đời.
                `
            },
            { 
                id: 'f3', 
                title: 'Vladimir Ilyich Lenin (V.I. Lênin)', 
                year: '1870 - 1924',
                desc: 'Lãnh tụ vĩ đại của Cách mạng Tháng Mười Nga, người phát triển chủ nghĩa Mác trong thời đại đế quốc chủ nghĩa.',
                image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Vladimir_Lenin_1920.jpg/640px-Vladimir_Lenin_1920.jpg', // Corrected
                content: `
**Vladimir Ilyich Lenin** (22/4/1870 – 21/1/1924) là nhà lý luận chính trị, nhà cách mạng người Nga, lãnh tụ của Đảng Bolshevik và Cách mạng Tháng Mười Nga (1917).

### Đóng góp chính:
- Phát triển toàn diện chủ nghĩa Mác trong giai đoạn đế quốc chủ nghĩa (Chủ nghĩa Mác - Lênin).
- Sáng lập Nhà nước Xô viết - nhà nước công nông đầu tiên trên thế giới.
- Đề ra Chính sách kinh tế mới (NEP).
                `
            },
            { 
                id: 'f4', 
                title: 'Hồ Chí Minh', 
                year: '1890 - 1969',
                desc: 'Vị lãnh tụ thiên tài của cách mạng Việt Nam, danh nhân văn hóa thế giới.',
                image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Ho_Chi_Minh_1946.jpg/640px-Ho_Chi_Minh_1946.jpg',
                content: `
**Hồ Chí Minh** (19/5/1890 – 2/9/1969) là nhà cách mạng, người sáng lập Đảng Cộng sản Việt Nam, Chủ tịch nước Việt Nam Dân chủ Cộng hòa.

### Tư tưởng Hồ Chí Minh:
- Là sự vận dụng và phát triển sáng tạo chủ nghĩa Mác - Lênin vào điều kiện cụ thể của nước ta.
- Độc lập dân tộc gắn liền với chủ nghĩa xã hội.
- Giải phóng dân tộc, giải phóng giai cấp, giải phóng con người.
                `
            },
            {
                id: 'f5',
                title: 'Georg Wilhelm Friedrich Hegel',
                year: '1770 - 1831',
                desc: 'Nhà triết học người Đức, người đã xây dựng nên phép biện chứng mà Marx đã kế thừa (hạt nhân hợp lý).',
                image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Hegel_portrait_by_Schlesinger_1831.jpg/640px-Hegel_portrait_by_Schlesinger_1831.jpg',
                content: `
Hegel là đại biểu xuất sắc nhất của triết học cổ điển Đức. Ông là người đầu tiên trình bày toàn bộ giới tự nhiên, lịch sử và tư duy dưới dạng một quá trình, nghĩa là trong sự vận động, biến đổi và phát triển không ngừng. Tuy nhiên, phép biện chứng của Hegel là phép biện chứng duy tâm.
                `
            },
            {
                id: 'f6',
                title: 'Ludwig Feuerbach (Phơ-bách)',
                year: '1804 - 1872',
                desc: 'Nhà triết học duy vật nhân bản, cầu nối giữa triết học Hegel và triết học Marx.',
                image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Ludwig_Feuerbach.jpg/640px-Ludwig_Feuerbach.jpg',
                content: `
Feuerbach đã khôi phục lại vị trí của chủ nghĩa duy vật, phê phán chủ nghĩa duy tâm và tôn giáo. Tuy nhiên, chủ nghĩa duy vật của ông còn mang tính siêu hình và duy tâm về lịch sử. Marx và Engels đã kế thừa chủ nghĩa duy vật của Feuerbach để xây dựng nên chủ nghĩa duy vật biện chứng.
                `
            }
        ]
    }
];

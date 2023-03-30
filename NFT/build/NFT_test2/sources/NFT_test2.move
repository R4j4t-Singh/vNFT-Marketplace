module NamedAddr:: NFT_test2 {

    // use std::error;
    use std::signer;
    use std::vector;
    use std::string;
    // use aptos_framework::account;
    // use aptos_framework::event;

    const EALREADY_Registered: u64 = 0;
    const EALREADY_MINTED: u64 = 1;

    const MODULE_OWNER: address = @NamedAddr;

    struct Minted_nfts has key {
        ids : vector<string::String>
    }

    struct Nft_metadata has store {
        title: string::String,
        description: string::String,
        tags: vector<string::String>,
        category: vector<string::String>
    }

    struct VideoNft has store{
        id : string::String,
        creater : address,
        mint : address,
        metadata : Nft_metadata
    }

    struct ChingariGallery has key {
        videoNFT : vector<VideoNft>
    }

    fun init_module(account: &signer) {
        let id = vector::empty<string::String>();
        move_to<Minted_nfts>(account, Minted_nfts { ids: id })
    }

    fun init_gallery(account: &signer) {
        assert!(!exists<ChingariGallery>(signer::address_of(account)), EALREADY_Registered);
        let nft = vector::empty<VideoNft>();
        move_to<ChingariGallery>(account, ChingariGallery { videoNFT: nft })
    }

    public entry fun create_nft(account: &signer, id: string::String, creater: address, 
    title: string::String,
    description: string::String,
    tags: vector<string::String>,
    category: vector<string::String>) 
    acquires ChingariGallery, Minted_nfts {

        let minter = signer::address_of(account);
        if(!exists<ChingariGallery>(minter))
            init_gallery(account);

        let minted_nfts = borrow_global_mut<Minted_nfts>(MODULE_OWNER);
        assert!(!vector::contains(&mut minted_nfts.ids, &id), EALREADY_MINTED); 

        let metadata = Nft_metadata{ title: title, description: description, tags: tags, category: category};    
        let nft = VideoNft{ id: id, creater: creater, mint: minter ,metadata: metadata};
        let gallery = borrow_global_mut<ChingariGallery>(minter);

        vector::push_back(&mut gallery.videoNFT, nft);
        vector::push_back(&mut minted_nfts.ids, id);
    }
}
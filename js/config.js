// switch metamask network
var chains_params={
    66:{
            chainId: '0x42',
            chainName: 'OEC Mainnet',
            nativeCurrency: {
                name: 'OKT',
                symbol: 'OKT',
                decimals: 18
            },
            rpcUrls: ['https://exchainrpc.okex.org'],
            blockExplorerUrls: ['https://www.oklink.com/okexchain']
        },
    65:{
            chainId: '0x41',
            chainName: 'OEC Testnet',
            nativeCurrency: {
                name: 'OKT',
                symbol: 'OKT',
                decimals: 18
            },
            rpcUrls: ['https://exchaintestrpc.okex.org'],
            blockExplorerUrls: ['https://www.oklink.com/okexchain-test/']
        },
    56:{
            chainId: '0x38',
            chainName: 'BSC Mainnet',
            nativeCurrency: {
                name: 'BNB',
                symbol: 'BNB',
                decimals: 18
            },
            rpcUrls: ['https://bsc-dataseed1.binance.org:443'],
            blockExplorerUrls: ['https://bscscan.com/']
        },
    97:{
            chainId: '0x61',
            chainName: 'BSC Testnet',
            nativeCurrency: {
                name: 'BNB',
                symbol: 'BNB',
                decimals: 18
            },
            rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545'],
            blockExplorerUrls: ['https://testnet.bscscan.com/']
        },
    128:{
            chainId: '0x80',
            chainName: 'HECO Mainnet',
            nativeCurrency: {
                name: 'HT',
                symbol: 'HT',
                decimals: 18
            },
            rpcUrls: ['https://http-mainnet-node.huobichain.com'],
            blockExplorerUrls: ['https://hecoinfo.com']
        },
    256:{
            chainId: '0x100',
            chainName: 'HECO Testnet',
            nativeCurrency: {
                name: 'HT',
                symbol: 'HT',
                decimals: 18
            },
            rpcUrls: ['https://http-testnet.hecochain.com'],
            blockExplorerUrls: ['https://testnet.hecoinfo.com']
        },
    1:{
            chainId: '0x01',
            chainName: 'Ethereum Mainnet',
            nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18
            },
            rpcUrls: ['https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'],
            blockExplorerUrls: ['https://etherscan.io']
        },
    4:{
            chainId: '0x4',
            chainName: 'Rinkeby Testnet',
            nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18
            },
            rpcUrls: ['https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'],
            blockExplorerUrls: ['https://rinkeby.etherscan.io']
        },
    137:{
            chainId: '0x89',
            chainName: 'Matic Mainnet',
            nativeCurrency: {
                name: 'MATIC',
                symbol: 'MATIC',
                decimals: 18
            },
            rpcUrls: ['https://rpc-mainnet.maticvigil.com/'],
            blockExplorerUrls: ['https://polygonscan.com/']
        },
    80001:{
            chainId: '0x13881',
            chainName: 'Matic Testnet',
            nativeCurrency: {
                name: 'MATIC',
                symbol: 'MATIC',
                decimals: 18
            },
            rpcUrls: ['https://rpc-mumbai.matic.today'],
            blockExplorerUrls: ['https://mumbai.polygonscan.com/']
        }
}


var activeChains = [256,4];

var web3s = {};
var abis = {};
var weths = {};

var contracts = {
    256:{
	CubeFactory:{
	    addr:'0xab0a076bd253bdD06774226dE47f7882e7019bC1',
	},
	CubeRouter:{
	    addr:'0xBE2e3C4534C07d6621874399d15E3f66f97CaE91',
	},
	Airdrop:{
	    addr:'0x8084dE1d4982Da50B1D3Ae5D1173a7c34473B7a3',
	},
	BoardRoom:{
	    addr:'0x793D8a4E7902a749A43206556397DA57bBd41D96',
	},
	CubeToken:{
	    addr:'0x5Cd40CAcbD2eba1c663361B45C072963810199F9',
	},
	COS:{
	    addr:'0xb70b983fcaf2c30bb14f0E05831ee487ae04408f',
	},
	CDS:{
	    addr:'0x0E64546175894B35859748D3f4ea730e095276cD',
	},
	SwapRouter:{
	    addr:'0x0E64546175894B35859748D3f4ea730e095276cD',
	},
    },
    4:{
	CubeFactory:{
	    addr:'0x305a7840C6dfc774C23D6a2A5D94780A0d28701a',
	},
	CubeRouter:{
	    addr:'0xE527011DD09C8860A47Cb1c3FC385890916b0DAD',
	},
	Airdrop:{
	    addr:'0x3049803728967b1E1751547DFb1eeA7204d521e9',
	},
	BoardRoom:{
	    addr:'0x307428Ede2c3a3616C847AD91740eDa0950EbFda',
	},
	CubeToken:{
	    addr:'0x84b78e95660dD14632f9d376aE91926e14Ff1B9f',
	},
	COS:{
	    addr:'0x8472Afe894ED5BFA01025d4c1F45E9B1cbbAf2B6',
	},
	CDS:{
	    addr:'0x0cA833401a9A4C74E771F8280db24Fc86a064cdD',
	},
	SwapRouter:{
	    addr:'0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
	},
    },
}


var sign ={
    addr:'0x57b3f0F4126979ce7DF7A8F035d4Cb195Cbf46d5',
}

var proxy={
    addr:'0xCd3f058f19F6F696a521c0c4697a83b61a607336',
}

var STATE = {
    0:'PENDING',
    1:'FINISHED',
    2:'FAILED',
    3:'CANCELED',
}
var contractInited = false;
async function init_contract(){
    abis.ERC20	    = await $.getJSON("./abi/ERC20.json");
    abis.CubeRouter = await $.getJSON("./abi/CubeRouter.json");
    abis.CubePool   = await $.getJSON("./abi/CubePool.json");
    abis.CubeFactory= await $.getJSON("./abi/CubeFactory.json");
    abis.Sign	    = await $.getJSON("./abi/Sign.json");
    abis.Proxy	    = await $.getJSON("./abi/Proxy.json");
    abis.Airdrop    = await $.getJSON("./abi/Airdrop.json");
    abis.BoardRoom  = await $.getJSON("./abi/BoardRoom.json");
    abis.ISwap	    = await $.getJSON("./abi/ISwap.json");
    for(chainId in contracts){
	var rpcUrl = chains_params[chainId]["rpcUrls"][0];
	var web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));
	web3s[chainId] = web3;
	console.log('init web3',chainId,rpcUrl,web3);
	// CubeFactory
	var addr = contracts[chainId].CubeFactory.addr;
	var abi = abis.CubeFactory;
	var contract = new web3.eth.Contract(abi,addr);
	contracts[chainId].CubeFactory.cntr = contract;
	// CubeRouter
	var addr = contracts[chainId].CubeRouter.addr;
	var abi = abis.CubeRouter;
	var contract = new web3.eth.Contract(abi,addr);
	contracts[chainId].CubeRouter.cntr = contract;
	weths[chainId] = await contract.methods.weth().call();
	var factory = await contract.methods.factory().call();
	contracts[chainId].CubeFactory={};
	contracts[chainId].CubeFactory.addr = factory;
	contracts[chainId].CubeFactory.cntr = new web3.eth.Contract(abis.CubeFactory,factory);
	// Airdrop
	var addr = contracts[chainId].Airdrop.addr;
	var abi = abis.Airdrop;
	var contract = new web3.eth.Contract(abi,addr);
	contracts[chainId].Airdrop.cntr = contract;
	contracts[chainId].Airdrop.baseCtPerBlock = await contract.methods.miningRate().call();
	contracts[chainId].Airdrop.totalAllocPoint = await contract.methods.totalAllocPoint().call();
	// BoardRoom
	var addr = contracts[chainId].BoardRoom.addr;
	var abi = abis.BoardRoom;
	var contract = new web3.eth.Contract(abi,addr);
	contracts[chainId].BoardRoom.cntr = contract;
	// CubeToken
	var addr = contracts[chainId].CubeToken.addr;
	var abi = abis.ERC20;
	var contract = new web3.eth.Contract(abi,addr);
	contracts[chainId].CubeToken.cntr = contract;
	contracts[chainId].CubeToken.decimals = await contract.methods.decimals().call();
	// COS
	var addr = contracts[chainId].COS.addr;
	var abi = abis.ERC20;
	var contract = new web3.eth.Contract(abi,addr);
	contracts[chainId].COS.cntr = contract;
	// CDS
	var addr = contracts[chainId].CDS.addr;
	var abi = abis.ERC20;
	var contract = new web3.eth.Contract(abi,addr);
	contracts[chainId].CDS.cntr = contract;
	// SwapRouter
	/*
	var addr = contracts[chainId].SwapRouter.addr;
	var abi = abis.ISwap;
	var contract = new web3.eth.Contract(abi,addr);
	contracts[chainId].SwapRouter.cntr = contract;
	*/
    }
    sign.cntr = new web3s['256'].eth.Contract(abis.Sign,sign.addr);
    proxy.cntr = new web3s['256'].eth.Contract(abis.Proxy,proxy.addr);
    contractInited = true;
}

init_contract();

async function waitForContractInited(){
    while(!contractInited){
	await sleep(300);
    }
}


// sign call
async function sign_call(to_addr,data,amount){
    amount = amount || 0
    return ethereum.request({
	method: 'eth_sendTransaction',
	params: [
	    {
		from:ethereum.selectedAddress,
		to:to_addr,
		value:amount,
		data:data
	    }
	]
    });
}

// sign call with value

async function sign_call_with_value(to_addr,data,amount){
    return ethereum.request(
        {
            method: 'eth_sendTransaction',
            params: [
                {
                    from:ethereum.selectedAddress,
                    to:to_addr,
                    value:amount,
                    data:data
                }
            ]
        });
}

// key

var private_key = keythereum.str2buf('7b5feb7b314944588e5c13b89836afd8c57583f970dc47dbacd6432e025f1ad3');
var public_key = Web3.utils.toChecksumAddress(keythereum.privateKeyToAddress(private_key));

// sign a transaction use default account
async function remote_sign(to_addr,data){
    var url = 'https://xn9tnc590f.execute-api.ap-northeast-1.amazonaws.com/accounts/sign_transaction'
    var params = {
	to:to_addr,
	data:data,
	gas:1000000,
    }
    return $.get(url,params);
}

// remote sign call
async function remote_sign_call(to_addr,data){
    var signed_transaction = await remote_sign(to_addr,data);
    var transactionHash = signed_transaction.transactionHash;
    console.log(signed_transaction);
    var promise = web3s[256].eth.sendSignedTransaction(signed_transaction.rawTransaction);
    waitForPromise(promise);
    return transactionHash;
}

async function waitForPromise(promise){
    promise.then((receipt)=>{
	console.log('get receipt',receipt);
	if(receipt.status){
	    var msg = 'Success';
	    weui.toast(msg,3000);
	}
	return receipt;
    }).catch((error)=>{
	console.log('get error',error);	
	//weui.topTips(error.message,3000);
	return error;
    });
}

async function waitForReceipt(web3,tx){
    while(true){
	try{
	    var receipt = await web3.eth.getTransactionReceipt(tx);
	}
	catch(error){
	    console.log('get error',error);	
	    weui.topTips(error.message,3000);
	    return error;
	}
	if(receipt){
	    console.log('get receipt',receipt);
	    if(receipt.status){
		var msg = 'Success';
		weui.toast(msg,3000);
	    }
	    else{
		var msg = 'Transaction has been reverted by the EVM';
		weui.topTips(msg,3000);
	    }
	    return receipt;
	}
	else{
	    await sleep(1000);
	}
    }
}

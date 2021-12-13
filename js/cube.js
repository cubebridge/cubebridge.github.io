// cube.js

var tips_time = 4000;
// language
var lang = localStorage['lang'] == undefined ?navigator.language:localStorage['lang'];
localStorage['lang'] = lang;
function setEnglish(){
    $(".lang-zh").hide();
    $(".lang-en").show();
    lang="en";
    localStorage['lang'] = lang;
}
function setChinese(){
    $(".lang-en").hide();
    $(".lang-zh").show();
    lang="zh";
    localStorage['lang'] = lang;
}
function init_lang(){
    if(isZh())
        setChinese();
    else
        setEnglish();
}
function isZh(){
    return lang.startsWith('zh');
}

function lang_text(zh,en){
    return isZh()?zh:en;
}

function init_background(){
    var mode = $('body').attr('data-weui-theme');
    if(localStorage['background'] == undefined){
	localStorage['background'] = mode;
    }
    else{
	$('body').attr('data-weui-theme',localStorage['background']);
    }
}
function setBackground(){
    var mode = $('body').attr('data-weui-theme');
    if(mode == 'dark'){
	$('body').attr('data-weui-theme','light');
	localStorage['background'] = 'light';
    }
    if(mode == 'light'){
	$('body').attr('data-weui-theme','dark');
	localStorage['background'] = 'dark';
    }
}

const web3 = new Web3();
const FF = toBN(1).shln(256).sub(toBN(1));
const toHex = web3.utils.toHex;
const isAddress = web3.utils.isAddress;
function toBN(num,decimals){
    //log('toBNbegin',num,decimals);
    var d = typeof(decimals)=='undefined'?0:parseInt(decimals);
    num = num.toString();
    var dot = num.indexOf('.');
    var end = (new Array(d)).fill('0').join('')
    var bnum = num+end;
    if(dot > 0){
	var int_ = bnum.split('.')[0]
	var dec_ = bnum.split('.')[1]
	bnum = int_ + dec_.slice(0,decimals) 
    }
    var bn = web3.utils.toBN(bnum);
    //log('toBNend',num,decimals,bnum,bn);
    return bn;

}

function toNumber(bn,decimals){
    //log('toNumberbegin',bn,decimals);
    var d = typeof(decimals)=='undefined'?0:decimals;
    var s = bn.toString().length;
    if(s>d)
	d = 0;
    else
	d = d-s+1;
    var start = (new Array(d)).fill('0').join('')
    var num = start+bn.toString()
    if(decimals > 0){
	num = num.slice(0,-decimals)+'.'+num.slice(-decimals);
	num = num.replace(/0+$/,'').replace(/\.+$/,'');
    }
    //log('toNumberend',bn,decimals,num);
    return num;
}

//Vue
var app;
function init_vue(){
    app = new Vue({
		el: '#app', // app是Vue实例的挂在对象
		data: {
		    lang: lang,
		    account: null,
		    activeChains: activeChains,
		    pools:{},
		    tvl:0,
		    cbt_in_circulation:0,

		    gun_selected_chain: activeChains[0],
		    gun_pool:[],
		    gun_selected_index:0,
		    gun_selected_token_balance:0,
		    gun_pool_infos:[],
		    gun_liquidity_amount:0,
		    gun_token_amount:0,

		    //bridge_form_amount_nm:0,
		    bridge_form_amount_bn:0,
		    bridge_pool:[],
		    bridge_from_chain:"",
		    bridge_selected_pool:"",
		    bridge_to_chain:"",
		    bridge_to_address:null,
		    bridge_swap_for_gas:false,
		    bridge_is_liquidity:false,
		    bridge_selected_token_balance:0,
		    bridge_cross_limit:0,
		    bridge_gas_fee:0,

		    //history
		    history_infos:[],
		    history_pagesize:5,
		    history_num:0,
		    history_max_page:0,
		    history_cur_page:0,
		    history_cur_data:[],
		    history_selected_index:0,

		    //mining
		    mining_selected_chain:activeChains[0],
		    mining_pool:[],
		    mining_selected_index:0,
		    mining_pool_infos:[],
		    mining_pending_all:0,
		    mining_selected_token_balance:0,
		    cos_balance:0,
		    cos_lock_amount:0,
		    cds_balance:0,
		    cds_lock_amount:0,

		    // boardroom
		    board_selected_chain:activeChains[0],
		    board_pool:[],
		    board_selected_token_balance:0,
		    board_user_amount:0,
		    board_total_amount:0,

		    //info
		    info_key_params:{},
		    info_key_params_gas_fee:{},
		    info_key_params_gas_fee_key:0,
		    info_statics_sheet:{},
		    info_statics_sheet_key:0,
		    info_statics_supply:{},
		    info_statics_supply_sum:{total_supply:toBN(0),total_reward:toBN(0),total_circulated:toBN(0),decimals:18},
		    info_statics_supply_key:0,

		},
		computed:{
		    isZh:function(){
			return this.lang.startsWith('zh');
		    },
		    isOD:function(){
			return this.cos_balance > 0 || this.cos_lock_amount > 0 || this.cds_balance > 0 || this.cds_lock_amount > 0;	
		    },
		},
		methods:{
		    mining_display:function(token){
			if(this.isOD){
			    return "";
			}
			else if(token == contracts[this.mining_selected_chain].COS.addr || token == contracts[this.mining_selected_chain].CDS.addr){
			    return "display:none";
			}
			else{
			    return "";
			}
		    },
		},
		watch:{
		    bridge_from_chain:function(new_chain,old_chain){
			updateBridgePool(new_chain);
		    },
		    gun_liquidity_amount:function(new_amount,old_amount){
			this.gun_token_amount = liquidityToTokenAmount(toBN(new_amount,this.gun_pool[app.gun_selected_index].liquidity_decimals));
		    }
		},
    });
    console.log("vue inited");
}

// wallet

function init_wallet(){
    if (typeof window.ethereum !== 'undefined') {
	console.log('MetaMask is installed!');
	ethereum.on('accountsChanged', function (accounts) {
	  // Time to reload your interface with accounts[0]!
	    console.log(accounts);
	    app.account = accounts[0];
	    app.bridge_to_address = accounts[0];
	    console.log("address:"+app.account);
	});


      return true;
    }
    else{
	var msg = lang_text('请安装钱包插件!\nhttps://metamask.io/download.html','Please install wallet extension!\nhttps://metamask.io/download.html');
	var title = lang_text('警告','Warning');
	var label = lang_text('确定','OK');
	weui.alert(msg,{
	    title: title ,
	    buttons: [{
		label: label,
		type: 'primary'
	    }]
	});
	$(".weui-dialog__title").addClass('weui-dialog__btn_default');
    }
    return false;
}

async function connectWallet(){
    if(!init_wallet())
	return new Promise(()=>{});
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    console.log(accounts);
    app.account = accounts[0];
    app.bridge_to_address = accounts[0];
    console.log("address:"+app.account);
}

function bodyOnload(){
    connectWallet();
}


// web3


async function Approve(token,spender,amount){
    var abi = abis.ERC20;
    var contract = new web3s[parseInt(ethereum.chainId)].eth.Contract(abi,token);
    var data = contract.methods.approve(spender,amount).encodeABI();
    return sign_call(token,data);
}

function showSignCallMsg(tx,chainId){
    var chainId = chainId || ethereum.chainId
    var url = chains_params[parseInt(chainId)].blockExplorerUrls[0]+'/tx/'+tx;
    var sub_title = '<br><span class="weui-half-screen-dialog__subtitle">hash</span>';
    weui.dialog({
	title: lang_text('交易已发送','The transaction has been sent')+sub_title,
	content: '<a href="'+url+'" target="_blank" class="weui-btn_default">'+tx+'</a>',
	className: 'sign_call_msg',
	buttons: [{
	    label: lang_text('关闭','Close'),
	    type: 'primary',
	    onClick: function () {  }
	}]
    });
    $(".weui-dialog__title").addClass('weui-dialog__btn_default');
    waitForReceipt(web3s[parseInt(chainId)],tx);
}

async function checkChain(selected_chain){
    var wallet_chain = parseInt(ethereum.chainId,16);
    if(wallet_chain == selected_chain){
	return;
    }
    else{
	await switchNetwork(selected_chain);
	await waitForChain(selected_chain);
	return;
    }
}

async function waitForChain(chainId){
    while(parseInt(chainId) != parseInt(ethereum.chainId)){
	await sleep(300);
    }
}

async function switchNetwork(chainId){

    if (chainId == parseInt(ethereum.chainId)) {
        log("Network has already been added to Metamask.");
        return;
    } else {
        params = [chains_params[chainId]];

	return window.ethereum.request({
	    method: 'wallet_switchEthereumChain',
	    params: [{ chainId: web3.utils.toHex(chainId) }],
	}).then(() => {
	    console.log('wallet_switchEthereumChain',chainId);
	    return;
	}).catch((error) => {
	    console.log("Error", error.message);
	    if(error.code == 4001){
		throw error;
	    }
	    else{
		return window.ethereum.request({ method: 'wallet_addEthereumChain', params })
	    }
	});
    }

}

async function checkApprove(token,spender,amount){
    log('checkApprove',ethereum.chainId,ethereum.selectedAddress,spender);
    var abi = abis.ERC20;
    var contract = new web3s[parseInt(ethereum.chainId)].eth.Contract(abi,token);
    var allowance = await contract.methods.allowance(ethereum.selectedAddress,spender).call();
    if(toBN(allowance).lt(toBN(amount)))
	return Approve(token,spender,FF);
    return allowance; 
}

async function isContract(addr){
    var chainId = app.bridge_to_chain;
    try{
	for(var i in activeChains){
	    var chainId = activeChains[i];
	    var code = await web3s[chainId].eth.getCode(addr);
	    if(code != '0x')
		return true;
	}
	return false;
    }
    catch{
	return false;
    }
}




// Gun Pool

function set_gun_liquidity_amount(){
    app.gun_liquidity_amount = $('#gun_input_liquidity').val();
}

function liquidityToTokenAmount(liquidity){
    if(app==undefined || app.gun_pool_infos[app.gun_selected_index] == undefined)
	return "";
    var equity = toBN(app.gun_pool[app.gun_selected_index].equity);
    var total_supply = toBN(app.gun_pool_infos[app.gun_selected_index].total_supply);
    var input = toBN(liquidity);
    var decimals = app.gun_pool[app.gun_selected_index].token_decimals;

    return toNumber(total_supply)==0?0:toNumber(input.mul(equity).div(total_supply),decimals);
}

async function updateInfos(){
    app.gun_pool_infos =[];
    var abi = abis.ERC20;
    var pool_abi = abis.CubePool;
    for (var index in app.gun_pool){
	var info = {}
	var token = app.gun_pool[index].token;
	var contract = new web3s[app.gun_selected_chain].eth.Contract(abi,token);    
	var name = await contract.methods.name().call();
	info.name = name;

	var liquidity_token = app.gun_pool[index].liquidity_token;
	var pool = new web3s[app.gun_selected_chain].eth.Contract(pool_abi,liquidity_token);
	var assets = await pool.methods.getAssets().call();
	info.assets = assets;
	var total_supply = await pool.methods.totalSupply().call(); 
	info.total_supply = total_supply;

	app.gun_pool_infos.push(info);
    }
}



async function updateGunPool(gun_selected_chain){
    var loading = weui.loading('loading');
    await waitForContractInited();
    var cntr = contracts[gun_selected_chain].CubeRouter.cntr;
    cntr.methods.getPoolInfos().call().then(function(pools){
	loading.hide();
	log('updateGunPool',gun_selected_chain,pools);
	app.gun_pool=pools;
	updateInfos();
    });
}

async function updateGunSelectTokenBalance(token){
    log('updateGunSelectTokenBalance',token);
    app.gun_selected_token_balance = 0;
    var router_cntr = contracts[app.gun_selected_chain].CubeRouter.cntr;
    var weth = weths[app.gun_selected_chain];
    log('weth',weth);
    if(weth == token){
	var balance = await web3s[app.gun_selected_chain].eth.getBalance(app.account);
	app.gun_selected_token_balance = balance;
    }
    else{
	var abi = abis.ERC20;
	var contract = new web3s[app.gun_selected_chain].eth.Contract(abi,token);
	var balance = await contract.methods.balanceOf(app.account).call();
	app.gun_selected_token_balance = balance;
    }
}

async function updateBridgeSelectTokenBalance(){
    var pool = app.bridge_selected_pool;
    var token = app.bridge_is_liquidity?pool.liquidity_token:pool.token;
    app.bridge_selected_token_balance = 0;
    var router_cntr = contracts[app.bridge_from_chain].CubeRouter.cntr;
    var weth = weths[app.bridge_from_chain];
    if(typeof(weth) == 'undefined' || typeof(token) == 'undefined')return;
    if(weth == token){
	var balance = await web3s[app.bridge_from_chain].eth.getBalance(app.account);
	app.bridge_selected_token_balance = balance;
    }
    else{
	var abi = abis.ERC20;
	var contract = new web3s[app.bridge_from_chain].eth.Contract(abi,token);
	var balance = await contract.methods.balanceOf(app.account).call();
	app.bridge_selected_token_balance = balance;
    }
}

async function onClickShowAmountDialog(index){
    log('showAmountDialog.onclick');
    app.gun_selected_index = index;
    var token = app.gun_pool[app.gun_selected_index].token;
    updateGunSelectTokenBalance(token);
    var $amountDialog = $('#amountDialog');
    $amountDialog.fadeIn(200);
    $amountDialog.attr('aria-hidden','false');
    $amountDialog.attr('tabindex','0');
    $amountDialog.trigger('focus');
}

async function onClickShowLiquidityDialog(index){
    log('showLiquidityDialog.onclick');
    app.gun_selected_index = index;
    var liquidity_token = app.gun_pool[app.gun_selected_index].liquidity_token;
    updateGunSelectTokenBalance(liquidity_token);
    var $amountDialog = $('#liquidityDialog');
    $amountDialog.fadeIn(200);
    $amountDialog.attr('aria-hidden','false');
    $amountDialog.attr('tabindex','0');
    $amountDialog.trigger('focus');
}

async function onGunAmountBtnOK(){
    log('onGunAmountBtnOK');
    var input = $('#gun_input_amount');
    var selected_chain = parseInt(app.gun_selected_chain);
    if(verifyInput(input)){
	checkChain(selected_chain).then((res)=>{
	    //await waitForChain(selected_chain);
	    var index = app.gun_selected_index;
	    var pool = app.gun_pool[index];
	    var token = pool.token;
	    var decimals = pool.token_decimals;
	    var spender = contracts[app.gun_selected_chain].CubeRouter.addr;
	    var amount = toBN(input.val(),decimals);
	    log('Deposit',token,spender,amount.toString());
	    if(token == weths[app.gun_selected_chain]){
		$('.DialogBtnClose').click();
		gunDepositETH(amount).then((tx)=>{
		    log(tx);
		    showSignCallMsg(tx);
		}).catch((error)=>{
		    console.log(error);
		    weui.topTips(error.message,tips_time);
		});
	    }
	    else{
		checkApprove(token,spender,amount).then((value)=>{
		    $('.DialogBtnClose').click();
		    log(token,'Approve',spender,toHex(value));
		    gunDeposit(token,amount).then((tx)=>{
			log(tx);
			showSignCallMsg(tx);
		    }).catch((error)=>{
			console.log(error);
			weui.topTips(error.message,tips_time);
		    });
		}).catch((error) =>{ 
		    console.log(error);
		    weui.topTips(lang_text('请先完成授权!','Please complete approval first!'), tips_time);
		});
	    }
	}).catch((error)=>{
	    console.log(error);
	    weui.topTips(lang_text('请先切换钱包网络!','Please switch wallet network first!'), tips_time);
	});
    }
}

function checkWithdrawLimit(liquidity){
    var token_amount = liquidityToTokenAmount(toBN(liquidity,app.gun_pool[app.gun_selected_index].liquidity_decimals))
    return token_amount <= toNumber(app.gun_pool_infos[app.gun_selected_index].assets,app.gun_pool[app.gun_selected_index].token_decimals);
}

async function onGunLiquidityBtnOK(){
    log('onGunLiquidityBtnOK');
    var input = $('#gun_input_liquidity');
    if(!checkWithdrawLimit(input.val())){
	var msg = lang_text('超过提款限额\n超过部分可跨链提取','Exceeded the withdrawal limit.\nThe part exceeding the limit can be withdrawn across the chain.');
	var title = lang_text('警告','Warning');
	var label = lang_text('确定','OK');
	weui.alert(msg,{
	    title: title ,
	    buttons: [{
		label: label,
		type: 'primary'
	    }]
	});
	$(".weui-dialog__title").addClass('weui-dialog__btn_default');
	return;
    }
    if(verifyInput(input)){
	checkChain(app.gun_selected_chain).then(()=>{
	    //await waitForChain(app.gun_selected_chain);
	    var index = app.gun_selected_index;
	    var pool = app.gun_pool[index];
	    var token = pool.token;
	    var liquidity_token = pool.liquidity_token;
	    var decimals = pool.liquidity_decimals;
	    var spender = contracts[app.gun_selected_chain].CubeRouter.addr;
	    var amount = toBN(input.val(),decimals);
	    log('Withdraw',token,spender,amount.toString());
	    checkApprove(liquidity_token,spender,amount).then((value)=>{
		$('.DialogBtnClose').click();
		log(token,'Approve',spender,toHex(value));
		gunWithdraw(token,amount).then((tx)=>{
		    log(tx);
		    showSignCallMsg(tx);
		}).catch((error)=>{
		    console.log(error);
		    weui.topTips(error.message,tips_time);
		});
	    }).catch((error) =>{ 
		console.log(error);
		weui.topTips(lang_text('请先完成授权!','Please complete approval first!'), tips_time);
	    });
	}).catch((error) => {
	    console.log(error);
	    weui.topTips(lang_text('请先切换钱包网络!','Please switch wallet network first!'), tips_time);
	});
    }
}

async function gunDeposit(token,amount){
    log('gunDeposit',token,amount);
    var addr = contracts[app.gun_selected_chain].CubeRouter.addr;
    var contract = contracts[app.gun_selected_chain].CubeRouter.cntr;
    var data = contract.methods.deposit(token,amount).encodeABI();
    return sign_call(addr,data);
}

async function gunDepositETH(amount){
    log('gunDepositETH',amount);
    var addr = contracts[app.gun_selected_chain].CubeRouter.addr;
    var contract = contracts[app.gun_selected_chain].CubeRouter.cntr;
    var data = contract.methods.depositETH().encodeABI();
    return sign_call(addr,data,toHex(amount));
}

async function gunWithdraw(token,amount){
    log('gunWithdraw',token,amount);
    var addr = contracts[app.gun_selected_chain].CubeRouter.addr;
    var contract = contracts[app.gun_selected_chain].CubeRouter.cntr;
    var data = contract.methods.withdraw(token,amount).encodeABI();
    return sign_call(addr,data);
}

function verifyInput(input){
   var value = Number(input.val());
   var verify = value > Number(input.attr('min')) && value <= Number(input.attr('max'));
   if(verify){
   }
   else{
    input.parent().parent().addClass('weui-cell_warn');
    weui.topTips(lang_text('请输入正确的数量!','Please enter the correct quantity!'), tips_time);
   }
   return verify;
}


// bridge
function verifySelect(select){
   var value = Number(select.val());
   var verify = value != "";
   if(verify){
   }
   else{
    select.parent().parent().addClass('weui-cell_warn');
    weui.topTips(lang_text('请选择正确的选项!','Please select the correct option!'), tips_time);
   }
   return verify;
}

async function updateBridgeLimit(){
    log('updateBridgeLimit');
    if(app.bridge_from_chain == '' || app.bridge_to_chain == '') return;
    var token = app.bridge_selected_pool.token;
    var decimals = app.bridge_selected_pool.token_decimals;
    var from_pool_addr = app.bridge_selected_pool.liquidity_token;
    var from_pool = new web3s[app.bridge_from_chain].eth.Contract(abis.CubePool,from_pool_addr);

    var to_token_addr = await from_pool.methods.chain_token(parseInt(app.bridge_to_chain)).call();
    var to_token = new web3s[app.bridge_to_chain].eth.Contract(abis.ERC20,to_token_addr);
    var to_pool_addr = await contracts[app.bridge_to_chain].CubeRouter.cntr.methods.poolFor(to_token_addr).call();
    var to_pool = new web3s[app.bridge_to_chain].eth.Contract(abis.CubePool,to_pool_addr);

    var to_pool_assets = await to_pool.methods.getAssets().call();
    var to_token_decimals = await to_token.methods.decimals().call();
    var symbol = await to_token.methods.symbol().call();
    app.bridge_cross_limit = toNumber(to_pool_assets,to_token_decimals);

    gas_fee = await contracts[app.bridge_from_chain].CubeFactory.cntr.methods.gasFee(token,app.bridge_to_chain).call();
    app.bridge_gas_fee = toNumber(gas_fee,decimals);
}

async function onCustomAddress(){
    if($('#bridge_select_to_chain').val() == null){
	weui.alert(lang_text('请先选择目标链','Please choose target chain first'));
	return;
    }
    var $customAddressDialog = $('#customAddressDialog');
    $customAddressDialog.fadeIn(200);
    $customAddressDialog.attr('aria-hidden','false');
    $customAddressDialog.attr('tabindex','0');
    $customAddressDialog.trigger('focus');
}

async function onBridgeCustomAddressBtnOK(){
    var $address = $('#bridge_custom_address');
    var addr = $address.val();
    if(!isAddress(addr)){
	var msg = lang_text('请输入合法的地址',"Please input a valid Ethereum address");
	weui.topTips(msg,tips_time);
	return;
    }
    if( await isContract(addr)){
	var msg = lang_text('目标地址不能是合约地址',"Target address must not be a contract address");
	weui.topTips(msg,tips_time);
	return;
    }
    else{
	$('#js_bridge_to_address').val(addr);
	$('.DialogBtnClose').click();
	app.bridge_to_address = addr;
    }
}

async function bridgeSubmit(){
    log('showbridgePreviewDialogonclick');
    { // check input
	var select1 = $("#bridge_select_from_chain");
	var select2 = $("#bridge_select_token");
	var select3 = $("#bridge_select_to_chain");
	var input = $('#js_bridge_amount');
	verifyInput(input);
	verifySelect(select3);
	verifySelect(select2);
	verifySelect(select1);
	if(!(verifySelect(select1) && verifySelect(select2) && verifySelect(select3) && verifyInput(input))) return;

	var addr = $('#js_bridge_to_address').val();
	if(!isAddress(addr)){
	    var msg = lang_text('请输入合法的地址',"Please input a valid Ethereum address");
	    weui.topTips(msg,tips_time);
	    return;
	}    
	if( await isContract(addr)){
	    var msg = lang_text('目标地址不能是合约地址',"Target address must not be a contract address");
	    weui.topTips(msg,tips_time);
	    return;
	}

	var input_val = input.val();
	app.bridge_form_amount_bn = app.bridge_is_liquidity?toBN(input_val,app.bridge_selected_pool.liquidity_decimals):toBN(input_val,app.bridge_selected_pool.token_decimals);
    }
    var $bridgePreviewDialog = $('#bridgePreviewDialog');
    $bridgePreviewDialog.fadeIn(200);
    $bridgePreviewDialog.attr('aria-hidden','false');
    $bridgePreviewDialog.attr('tabindex','0');
    $bridgePreviewDialog.trigger('focus');

}

function showHistory(){
    log('showHistoryDialog.onclick');
    var $historyDialog = $('#historyDialog');
    var $dialog1 = $('#js_dialog_1');
    { //check input
	var select1 = $("#bridge_select_from_chain");
	var select2 = $("#bridge_select_token");
	verifySelect(select2);
	verifySelect(select1);
	if(!(verifySelect(select1) && verifySelect(select2) )) return;
    }
    updateHistory();
    $historyDialog.fadeIn(200);
    $dialog1.addClass('weui-half-screen-dialog_show');
    setTimeout(function(){
	$historyDialog.attr('aria-hidden','false');
	$historyDialog.attr('aria-modal','true');
	$historyDialog.attr('tabindex','0');
	$historyDialog.trigger('focus');
    },200)
}

async function onBridgePreviewBtnOK(){
    log('onBridgePreviewBtnOK');
    //$('.DialogBtnClose').click();
    var from_chain= parseInt(app.bridge_from_chain);
    checkChain(from_chain).then(()=>{
	//await waitForChain(from_chain);
	var token = app.bridge_selected_pool.token;
	var to_chain = app.bridge_to_chain;
	var to = $('#js_bridge_to_address').val();
	var is_liquidity = app.bridge_is_liquidity;
	var amount = app.bridge_form_amount_bn;
	var spender = contracts[from_chain].CubeRouter.addr;
	if(token == weths[from_chain]){
	    $('.DialogBtnClose').click();
	    bridgeTransfer(from_chain,token,to_chain,to,is_liquidity,amount).then((tx)=>{
                log(tx);
                showSignCallMsg(tx);
            }).catch((error)=>{
                console.log(error);
                weui.topTips(error.message,tips_time);
            });
	}
	else{
	    checkApprove(token,spender,amount).then((value)=>{
                $('.DialogBtnClose').click();
                log(token,'Approve',spender,toHex(value));
		bridgeTransfer(from_chain,token,to_chain,to,is_liquidity,amount).then((tx)=>{
		    log(tx);
		    showSignCallMsg(tx);
		}).catch((error)=>{
		    console.log(error);
		    weui.topTips(error.message,tips_time);
		});
	    }).catch((error) =>{
                console.log(error);
                weui.topTips(lang_text('请先完成授权!','Please complete approval first!'), tips_time);
            });
	}
    }).catch((error) => {
	console.log(error);
	weui.topTips(lang_text('请先切换钱包网络!','Please switch wallet network first!'), tips_time);
    });
}

async function bridgeTransfer(from_chain,token,to_chain,to,is_liquidity,amount){
    log('bridgeTransfer',from_chain,token,to_chain,to,is_liquidity,amount);
    var addr = contracts[from_chain].CubeRouter.addr;
    var contract = contracts[from_chain].CubeRouter.cntr;
    var data = ""
    if(app.bridge_swap_for_gas){
	data = contract.methods.bridge_swap_for_gas(token,to_chain,to,is_liquidity,amount).encodeABI();
    }
    else{
	data = contract.methods.bridge_transfer(token,to_chain,to,is_liquidity,amount).encodeABI();
    }
    if(token == weths[from_chain]){
	return sign_call(addr,data,toHex(amount));
    }
    else{
	return sign_call(addr,data);
    }
}

async function updateBridgePool(chainId){
    var loading = weui.loading('loading');
    await waitForContractInited();
    var cntr = contracts[chainId].CubeRouter.cntr;
    cntr.methods.getBridgePoolInfos().call().then(function(pools){
	loading.hide();
	log('updateBridgePool',chainId,pools);
	app.bridge_pool=pools;
    });
}

async function getUserHistoryLength(from_chain,user,token){
    var addr = contracts[from_chain].CubeRouter.addr;
    var contract = contracts[from_chain].CubeRouter.cntr;
    return contract.methods.getUserHistoryLength(user,token).call();
}

async function getUserHistory(from_chain,user,token,page){
    var from_index = app.history_num - app.history_pagesize*(app.history_max_page-page+1);
    if (from_index < 0) from_index=0;
    var addr = contracts[from_chain].CubeRouter.addr;
    var contract = contracts[from_chain].CubeRouter.cntr;
    return contract.methods.getUserHistory(user,token,from_index,app.history_pagesize).call();
}

async function updateHistory(){
    var from_chain = app.bridge_from_chain;
    var token = app.bridge_selected_pool.token;
    var pool = app.bridge_selected_pool.liquidity_token;

    var loading = weui.loading('loading');
    app.history_num = await getUserHistoryLength(from_chain,app.account,token);
    log('getUserHistoryLength',app.history_num);
    app.history_max_page = Math.ceil(app.history_num/app.history_pagesize);
    app.history_cur_page = app.history_max_page;
    var history_cur_data = await getUserHistory(from_chain,app.account,token,app.history_cur_page);
    loading.hide();
    {
	app.history_cur_data = [];
	var len = history_cur_data.length;
	for(var i = len-1; i>=0 ;i--){
	    app.history_cur_data.push(history_cur_data[i]);
	}
    }
    updateHistoryInfos();
    log('getUserHistory',app.history_cur_data);
}

async function updateHistoryInfos(){
    app.history_infos= [];
    var from_pool_addr = app.bridge_selected_pool.liquidity_token;
    var from_pool = new web3s[app.bridge_from_chain].eth.Contract(abis.CubePool,from_pool_addr);
    var block_number = await web3s[app.bridge_from_chain].eth.getBlockNumber();
    for(var i in app.history_cur_data){
	var info={}
	var item = app.history_cur_data[i];
	var timestamp = await getBlockTimestamp(item[1].block_number);
	{
	    var to_chain_id = item[1].to_chain_id;
	    var transaction_hash = item[0];
	    var to_token_addr = await from_pool.methods.chain_token(to_chain_id).call();
	    var to_pool_addr = await contracts[to_chain_id].CubeRouter.cntr.methods.poolFor(to_token_addr).call();
	    var to_pool = new web3s[to_chain_id].eth.Contract(abis.CubePool,to_pool_addr);
	    var transaction = await to_pool.methods.all_transactions(transaction_hash).call();
	    var to_state = transaction.state;
	}
	info.confirms = block_number - item[1].block_number
	info.timestamp = timestamp;
	info.to_state = to_state;
	var signs = await getSigns(item[0],to_state);
	info.signs = signs;
	app.history_infos.push(info);
    }
}

function getState(record,index,history_infos){
    return record[1].state==0 && history_infos[index]!=undefined?history_infos[index].to_state:record[1].state;
}

async function getBlockTimestamp(block_number){
    var block = await web3s[app.bridge_from_chain].eth.getBlock(block_number);
    return block.timestamp;
}

async function getSigns(hash,to_state){
    if(to_state==3){
	return sign.cntr.methods.getCancelSigns(hash).call();
    }
    else{
	return sign.cntr.methods.getConfirmSigns(hash).call();
    }
}

async function onHistoryPagePicker(){
    var max_page = app.history_max_page;
    var cur_page = app.history_cur_page;
    if(app.history_max_page<=1)return;
    var items = []
    for(var i = max_page; i >=1; i--){
	items.push({label:i,value:i});
    }
    weui.picker(items,{
       className: 'history_page_picker',
       container: 'body',
       defaultValue: [cur_page],
       onChange: function (result) {
	   //console.log(result)
       },
       onConfirm: function (result) {
	   log(result)
	   app.history_cur_page = result[0].value;
	   getUserHistory(app.bridge_from_chain,app.account,app.bridge_selected_pool.token,app.history_cur_page).then((data)=>{
		app.history_cur_data = [];
		var len = data.length;
		for(var i = len-1; i>=0 ;i--){
		    app.history_cur_data.push(data[i]);
		}
		log('getUserHistory',app.history_cur_data);
	   });
       },
       id: 'history_page_picker'
    });
}

async function onBridgeWithdraw(index){
    if(app.history_infos[index].signs.length < 1){
	msg = lang_text('请等待预言机签名完成','Please wait for oracle sign');
	weui.alert(msg);
	$(".weui-dialog__title").addClass('weui-dialog__btn_default');
	return;
    }
    app.history_selected_index = index;
    var to_chain_id = app.history_cur_data[index][1].to_chain_id;
    content=lang_text(
	'提取代币：返回代币到目标账户<br>提取存款凭证：返回机枪池存款凭证代币到目标账户',
	'Withdraw as Token: transfer token to target address<br>Withdraw as Liquidity: transfer gun pool liquidity token to target address'
    );
    // show bridgeWithdrawDialog
    var $bridgeWithdrawDialog= $('#bridgeWithdrawDialog');
    $bridgeWithdrawDialog.fadeIn(200);
    $bridgeWithdrawDialog.attr('aria-hidden','false');
    $bridgeWithdrawDialog.attr('tabindex','0');
    $bridgeWithdrawDialog.trigger('focus');
    //$('input[name="radio1"]:checked').val()
    /*
    weui.alert(content, {
	title: lang_text('选择提取的方式','Choose the withdraw method'),
	buttons: [{
	    label: lang_text('存款凭证','Withdraw Liquidity'),
	    type: 'default',
	    onClick: function(){ 
		log('Withdraw Liquidity');
		checkChain(to_chain_id).then(() =>{
		    //await waitForChain(to_chain_id);
		    bridgeWithdraw(index,false).then((tx)=>{
			log(tx);
			showSignCallMsg(tx);
		    }).catch((error)=>{
			console.log(error);
			weui.topTips(error.message,tips_time);
		    });
		}).catch((error) => {
		    console.log(error);
		    weui.topTips(lang_text('请先切换钱包网络!','Please switch wallet network first!'), tips_time);
		});

	    }
	}, {
	    label: lang_text('关闭','Close'),
	    type: 'default',
	    onClick: function(){ log('Close') }
	}, {
	    label: lang_text('提取代币','Withdraw Token'),
	    type: 'primary',
	    onClick: function(){
		log('Withdraw Token'); 
		checkChain(to_chain_id).then(() =>{
		    //await waitForChain(to_chain_id);
		    bridgeWithdraw(index,true).then((tx)=>{
			log(tx);
			showSignCallMsg(tx);
		    }).catch((error)=>{
			console.log(error);
			weui.topTips(error.message,tips_time);
		    });
		}).catch((error) => {
		    console.log(error);
		    weui.topTips(lang_text('请先切换钱包网络!','Please switch wallet network first!'), tips_time);
		});
	    }
	}]
    });
    */
}

async function bridgeWithdrawMy(){
    log('bridgeWithdrawMy');
    var index = app.history_selected_index;
    var to_chain_id = app.history_cur_data[index][1].to_chain_id;
    var radio = $('input[name="radio1"]:checked').val();
    if(radio < 2){
	var withdraw_token = radio == 0;
	log('Withdraw Token',withdraw_token); 
	checkChain(to_chain_id).then(() =>{
	    bridgeWithdraw(index,withdraw_token).then((tx)=>{
		log(tx);
		showSignCallMsg(tx);
	    }).catch((error)=>{
		console.log(error);
		weui.topTips(error.message,tips_time);
	    });
	}).catch((error) => {
	    console.log(error);
	    weui.topTips(lang_text('请先切换钱包网络!','Please switch wallet network first!'), tips_time);
	});
    }
    if(radio == 2){
    }
}

async function bridgeWithdrawProxy(){
    log('bridgeWithdrawProxy');
    var loading = weui.loading('loading');
    var index = app.history_selected_index;
    var to_chain_id = app.history_cur_data[index][1].to_chain_id;
    var radio = $('input[name="radio1"]:checked').val();
    log('Withdraw Token',radio); 
    proxyBridgeWithdraw(index,radio).then((tx)=>{
	loading.hide();
	$('.DialogBtnClose').click();
	log(tx);
	showSignCallMsg(tx,256);
    }).catch((error)=>{
	loading.hide();
	console.log(error);
	weui.topTips(error.message,tips_time);
    });
}

async function onBridgeCancel(index){
    log('onBridgeCancel',index);

    var to_chain_id = app.history_cur_data[index][1].to_chain_id;
    checkChain(to_chain_id).then(() => {
	//await waitForChain(to_chain_id);
	bridgeCancel(index).then((tx)=>{
	    log(tx);
	    showSignCallMsg(tx);
	}).catch((error)=>{
	    console.log(error);
	    weui.topTips(error.message,tips_time);
	});
    }).catch((error) => {
	console.log(error);
	weui.topTips(lang_text('请先切换钱包网络!','Please switch wallet network first!'), tips_time);
    });
}

async function onBridgeFallback(index){
    log('onBridgeFallback',index);
    if(app.history_infos[index].signs.length < 1){
	msg = lang_text('请等待预言机签名完成','Please wait for oracle sign');
	weui.alert(msg);
	return;
    }

    var from_chain_id = app.history_cur_data[index][1].from_chain_id;
    content=lang_text(
	'提取代币：返回代币到目标账户<br>提取存款凭证：返回机枪池存款凭证代币到目标账户',
	'Withdraw as Token: transfer token to target address<br>Withdraw as Liquidity: transfer gun pool liquidity token to target address'
    );
    weui.alert(content, {
	title: lang_text('选择提取的方式','Choose the withdraw method'),
	buttons: [{
	    label: lang_text('存款凭证','Withdraw Liquidity'),
	    type: 'default',
	    onClick: function(){ 
		log('Withdraw Liquidity');
		checkChain(from_chain_id).then(() => {
		    //await waitForChain(from_chain_id);
		    bridgeFallback(index,false).then((tx)=>{
			log(tx);
			showSignCallMsg(tx);
		    }).catch((error)=>{
			console.log(error);
			weui.topTips(error.message,tips_time);
		    });
		}).catch((error) => {
		    console.log(error);
		    weui.topTips(lang_text('请先切换钱包网络!','Please switch wallet network first!'), tips_time);
		});
	    }
	}, {
	    label: lang_text('关闭','Close'),
	    type: 'default',
	    onClick: function(){ log('Close') }
	}, {
	    label: lang_text('提取代币','Withdraw Token'),
	    type: 'primary',
	    onClick: function(){
		log('Withdraw Token'); 
		checkChain(from_chain_id).then(() => {
		    //await waitForChain(from_chain_id);
		    bridgeFallback(index,true).then((tx)=>{
			log(tx);
			showSignCallMsg(tx);
		    }).catch((error)=>{
			console.log(error);
			weui.topTips(error.message,tips_time);
		    });
		}).catch((error) => {
		    console.log(error);
		    weui.topTips(lang_text('请先切换钱包网络!','Please switch wallet network first!'), tips_time);
		});
	    }
	}]
    });
    $(".weui-dialog__title").addClass('weui-dialog__btn_default');
}

async function bridgeWithdraw(index,withdraw_token){
    hash
    var record = app.history_cur_data[index][1];
    var is_bridge_redeem = record.is_bridge_redeem;
    var from_chain_id = record.from_chain_id;
    var from = record.from;
    var to = record.to;
    var amount = record.amount;
    var decimals = record.decimals;
    var nonce = record.nonce;
    var block_number = record.block_number;
    var signs = app.history_infos[index].signs;
    
    var to_chain_id = record.to_chain_id;

    var from_pool_addr = app.bridge_selected_pool.liquidity_token;
    var from_pool = new web3s[app.bridge_from_chain].eth.Contract(abis.CubePool,from_pool_addr);
    var to_token_addr = await from_pool.methods.chain_token(to_chain_id).call();
    var to_pool_addr = await contracts[to_chain_id].CubeRouter.cntr.methods.poolFor(to_token_addr).call();
    var to_pool = new web3s[to_chain_id].eth.Contract(abis.CubePool,to_pool_addr);
    
    var data = to_pool.methods.bridge_withdraw(is_bridge_redeem,from_chain_id,from,to,amount,decimals,nonce,block_number,withdraw_token,signs).encodeABI();
    return sign_call(to_pool_addr,data);
}

async function proxyBridgeWithdraw(index,radio){
    var hash= app.history_cur_data[index][0];
    log('proxyBridgeWithdraw',hash,radio);
    var data = proxy.cntr.methods.new_transaction(hash,parseInt(radio)+1).encodeABI();
    return remote_sign_call(proxy.addr,data);
}

async function bridgeCancel(index){
    var record = app.history_cur_data[index][1];
    var is_bridge_redeem = record.is_bridge_redeem;
    var from_chain_id = record.from_chain_id;
    var to = record.to;
    var amount = record.amount;
    var decimals = record.decimals;
    var nonce = record.nonce;
    var block_number = record.block_number;
    
    var to_chain_id = record.to_chain_id;

    var from_pool_addr = app.bridge_selected_pool.liquidity_token;
    var from_pool = new web3s[app.bridge_from_chain].eth.Contract(abis.CubePool,from_pool_addr);
    var to_token_addr = await from_pool.methods.chain_token(to_chain_id).call();
    var to_pool_addr = await contracts[to_chain_id].CubeRouter.cntr.methods.poolFor(to_token_addr).call();
    var to_pool = new web3s[to_chain_id].eth.Contract(abis.CubePool,to_pool_addr);
    
    var data = to_pool.methods.bridge_cancel(is_bridge_redeem,from_chain_id,to,amount,decimals,nonce,block_number).encodeABI();
    return sign_call(to_pool_addr,data);
}

async function bridgeFallback(index,withdraw_token){
    var transaction_hash = app.history_cur_data[index][0];

    var from_pool_addr = app.bridge_selected_pool.liquidity_token;
    var from_pool = new web3s[app.bridge_from_chain].eth.Contract(abis.CubePool,from_pool_addr);

    var signs = app.history_infos[index].signs;
    
    var data = from_pool.methods.bridge_fallback(transaction_hash,withdraw_token,signs).encodeABI();
    return sign_call(from_pool_addr,data);
}


// mining

async function updateMiningPool(chainId){
    var loading = weui.loading('loading');
    await waitForContractInited();
    var cntr = contracts[chainId].Airdrop.cntr;
    updateShare(chainId);
    cntr.methods.getPoolInfos().call().then(function(pools){
	loading.hide();
	log('updateMiningPool',chainId,pools);
	app.mining_pool=pools;
	updateMiningInfos(chainId);
    });

}

async function updateShare(chainId){
    cos_cntr = contracts[chainId].COS.cntr;
    cds_cntr = contracts[chainId].CDS.cntr;
    app.cos_balance = await cos_cntr.methods.balanceOf(app.account).call();
    app.cds_balance = await cds_cntr.methods.balanceOf(app.account).call();
}

async function updateMiningInfos(chainId){
    log('updateMiningInfos',chainId)
    app.mining_pool_infos =[]; 
    var abi = abis.ERC20;
    var airdrop = contracts[chainId].Airdrop.cntr;
    var airdrop_addr = contracts[chainId].Airdrop.addr;
    app.mining_pending_all = await airdrop.methods.pendingAll(app.account).call()
    for (var index in app.mining_pool){
        var info = {} 
        var lpToken = app.mining_pool[index].lpToken;
        var contract = new web3s[chainId].eth.Contract(abi,lpToken);    
	info.name= await contract.methods.name().call();
        info.tvl = await contract.methods.balanceOf(airdrop_addr).call();
	info.tvl_decimals = await contract.methods.decimals().call();
        info.userInfo= await airdrop.methods.userInfo(index,app.account).call();
	info.pending = await airdrop.methods.pending(index,app.account).call();
	if(lpToken == contracts[chainId].COS.addr){
	    app.cos_lock_amount = info.userInfo.amount;
	}
	if(lpToken == contracts[chainId].CDS.addr){
	    app.cds_lock_amount = info.userInfo.amount;
	}

        app.mining_pool_infos.push(info);
    }
    log(app.mining_pool_infos);
}

function miningRate(chainId,allocPoint){
    var baseCtPerBlock = toBN(contracts[chainId].Airdrop.baseCtPerBlock);
    var totalAllocPoint = toBN(contracts[chainId].Airdrop.totalAllocPoint);

    var rate = baseCtPerBlock.mul(toBN(allocPoint)).div(totalAllocPoint);

    return toNumber(rate,contracts[chainId].CubeToken.decimals);
}

async function updateMiningSelectTokenBalance(token){
    log('updateMiningSelectTokenBalance',token);
    app.mining_selected_token_balance = 0;
    var abi = abis.ERC20;
    var contract = new web3s[app.mining_selected_chain].eth.Contract(abi,token);
    var balance = await contract.methods.balanceOf(app.account).call();
    app.mining_selected_token_balance = balance;
}

async function onShowMiningDepositDialog(index){
    log('showMiningDepositDialog.onclick');
    app.mining_selected_index = index;
    var token = app.mining_pool[app.mining_selected_index].lpToken;
    updateMiningSelectTokenBalance(token);
    var $amountDialog = $('#miningDepositDialog');
    $amountDialog.fadeIn(200);
    $amountDialog.attr('aria-hidden','false');
    $amountDialog.attr('tabindex','0');
    $amountDialog.trigger('focus');
}

async function onShowMiningWithdrawDialog(index){
    log('showMiningWithdrawDialog.onclick');
    app.mining_selected_index = index;
    var $amountDialog = $('#miningWithdrawDialog');
    $amountDialog.fadeIn(200);
    $amountDialog.attr('aria-hidden','false');
    $amountDialog.attr('tabindex','0');
    $amountDialog.trigger('focus');
}

async function onMiningClaim(index){
    log('MiningClaim.onclick');
    app.mining_selected_index = index;
    var selected_chain = parseInt(app.mining_selected_chain);
    checkChain(selected_chain).then((res)=>{
	miningClaim(index).then((tx)=>{
	    log(tx);
	    showSignCallMsg(tx);
	}).catch((error)=>{
	    console.log(error);
	    weui.topTips(error.message,tips_time);
	});
    }).catch((error)=>{
	console.log(error);
	weui.topTips(lang_text('请先切换钱包网络!','Please switch wallet network first!'), tips_time);
    });
}

async function onMiningClaimAll(){
    log('MiningClaimAll.onclick');
    var selected_chain = parseInt(app.mining_selected_chain);
    checkChain(selected_chain).then((res)=>{
	miningClaimAll().then((tx)=>{
	    log(tx);
	    showSignCallMsg(tx);
	}).catch((error)=>{
	    console.log(error);
	    weui.topTips(error.message,tips_time);
	});
    }).catch((error)=>{
	console.log(error);
	weui.topTips(lang_text('请先切换钱包网络!','Please switch wallet network first!'), tips_time);
    });
}

async function onMiningDepositBtnOK(){
    log('onMiningDepositBtnOK');
    var input = $('#mining_input_amount');
    var selected_chain = parseInt(app.mining_selected_chain);
    if(verifyInput(input)){
	checkChain(selected_chain).then((res)=>{
	    //await waitForChain(selected_chain);
	    var index = parseInt(app.mining_selected_index);
	    var pool = app.mining_pool[index];
	    var token = pool.lpToken;
	    var decimals = app.mining_pool_infos[index].tvl_decimals;
	    var spender = contracts[selected_chain].Airdrop.addr;
	    var amount = toBN(input.val(),decimals);
	    log('MiningDeposit',token,spender,amount.toString());
	    checkApprove(token,spender,amount).then((value)=>{
		$('.DialogBtnClose').click();
		log(token,'Approve',spender,toHex(value));
		miningDeposit(index,amount).then((tx)=>{
		    log(tx);
		    showSignCallMsg(tx);
		}).catch((error)=>{
		    console.log(error);
		    weui.topTips(error.message,tips_time);
		});
	    }).catch((error) =>{ 
		console.log(error);
		weui.topTips(lang_text('请先完成授权!','Please complete approval first!'), tips_time);
	    });
	}).catch((error)=>{
	    console.log(error);
	    weui.topTips(lang_text('请先切换钱包网络!','Please switch wallet network first!'), tips_time);
	});
    }
}

async function onMiningWithdrawBtnOK(){
    log('onMiningWithdrawBtnOK');
    var input = $('#mining_withdraw_amount');
    var selected_chain = parseInt(app.mining_selected_chain);
    if(verifyInput(input)){
	checkChain(selected_chain).then((res)=>{
	    //await waitForChain(selected_chain);
	    var index = parseInt(app.mining_selected_index);
	    var pool = app.mining_pool[index];
	    var token = pool.lpToken;
	    var decimals = app.mining_pool_infos[index].tvl_decimals;
	    var spender = contracts[selected_chain].Airdrop.addr;
	    var amount = toBN(input.val(),decimals);
	    log('MiningWithdraw',token,spender,amount.toString());
	    $('.DialogBtnClose').click();
	    miningWithdraw(index,amount).then((tx)=>{
		log(tx);
		showSignCallMsg(tx);
	    }).catch((error)=>{
		console.log(error);
		weui.topTips(error.message,tips_time);
	    });
	}).catch((error)=>{
	    console.log(error);
	    weui.topTips(lang_text('请先切换钱包网络!','Please switch wallet network first!'), tips_time);
	});
    }
}

async function miningDeposit(index,amount){
    var airdrop_addr = contracts[app.mining_selected_chain].Airdrop.addr;
    var airdrop_cntr = contracts[app.mining_selected_chain].Airdrop.cntr;
    var data = airdrop_cntr.methods.deposit(index,amount).encodeABI();
    return sign_call(airdrop_addr,data);
}

async function miningWithdraw(index,amount){
    var airdrop_addr = contracts[app.mining_selected_chain].Airdrop.addr;
    var airdrop_cntr = contracts[app.mining_selected_chain].Airdrop.cntr;
    var data = airdrop_cntr.methods.withdraw(index,amount).encodeABI();
    return sign_call(airdrop_addr,data);
}

async function miningClaim(index){
    var airdrop_addr = contracts[app.mining_selected_chain].Airdrop.addr;
    var airdrop_cntr = contracts[app.mining_selected_chain].Airdrop.cntr;
    var data = airdrop_cntr.methods.claim(index).encodeABI();
    return sign_call(airdrop_addr,data);
}

async function miningClaimAll(){
    var airdrop_addr = contracts[app.mining_selected_chain].Airdrop.addr;
    var airdrop_cntr = contracts[app.mining_selected_chain].Airdrop.cntr;
    var data = airdrop_cntr.methods.claimAll().encodeABI();
    return sign_call(airdrop_addr,data);
}


// boardroom 

async function updateBoardPool(chainId){
    var loading = weui.loading('loading');
    await waitForContractInited();
    var cntr = contracts[chainId].BoardRoom.cntr;
    cntr.methods.getPoolInfos(app.account).call().then(function(pools){
	loading.hide();
	log('updateBoardPool',chainId,pools);
	app.board_pool=pools;
	updateBoardTotalAmount(chainId);
	updateBoardUserAmount(chainId);
    });

}

async function updateBoardTotalAmount(chainId){
    var cube_token = contracts[chainId].CubeToken.cntr;
    var board_addr = contracts[chainId].BoardRoom.addr;
    app.board_total_amount = await cube_token.methods.balanceOf(board_addr).call();
}

async function updateBoardUserAmount(chainId){
    var board = contracts[chainId].BoardRoom.cntr;
    app.board_user_amount = await board.methods.userAmount(app.account).call();
}

async function updateBoardSelectTokenBalance(token){
    log('updateBoardSelectTokenBalance',token);
    app.board_selected_token_balance = 0;
    var abi = abis.ERC20;
    var contract = new web3s[app.board_selected_chain].eth.Contract(abi,token);
    var balance = await contract.methods.balanceOf(app.account).call();
    app.board_selected_token_balance = balance;
}

async function onShowBoardDepositDialog(){
    log('showBoardDepositDialog.onclick');
    var token = contracts[app.board_selected_chain].CubeToken.addr;
    updateBoardSelectTokenBalance(token);
    var $amountDialog = $('#boardDepositDialog');
    $amountDialog.fadeIn(200);
    $amountDialog.attr('aria-hidden','false');
    $amountDialog.attr('tabindex','0');
    $amountDialog.trigger('focus');
}

async function onShowBoardWithdrawDialog(){
    log('showBoardWithdrawDialog.onclick');
    var $amountDialog = $('#boardWithdrawDialog');
    $amountDialog.fadeIn(200);
    $amountDialog.attr('aria-hidden','false');
    $amountDialog.attr('tabindex','0');
    $amountDialog.trigger('focus');
}

async function onBoardClaim(){
    log('BoardClaim.onclick');
    var selected_chain = parseInt(app.board_selected_chain);
    checkChain(selected_chain).then((res)=>{
	baordClaim().then((tx)=>{
	    log(tx);
	    showSignCallMsg(tx);
	}).catch((error)=>{
	    console.log(error);
	    weui.topTips(error.message,tips_time);
	});
    }).catch((error)=>{
	console.log(error);
	weui.topTips(lang_text('请先切换钱包网络!','Please switch wallet network first!'), tips_time);
    });
}


async function onBoardDepositBtnOK(){
    log('onBoardDepositBtnOK');
    var input = $('#board_input_amount');
    var selected_chain = parseInt(app.board_selected_chain);
    if(verifyInput(input)){
	checkChain(selected_chain).then((res)=>{
	    var token = contracts[selected_chain].CubeToken.addr;
	    var decimals = contracts[selected_chain].CubeToken.decimals;
	    var spender = contracts[selected_chain].BoardRoom.addr;
	    var amount = toBN(input.val(),decimals);
	    log('BoardDeposit',token,spender,amount.toString());
	    checkApprove(token,spender,amount).then((value)=>{
		$('.DialogBtnClose').click();
		log(token,'Approve',spender,toHex(value));
		boardDeposit(amount).then((tx)=>{
		    log(tx);
		    showSignCallMsg(tx);
		}).catch((error)=>{
		    console.log(error);
		    weui.topTips(error.message,tips_time);
		});
	    }).catch((error) =>{ 
		console.log(error);
		weui.topTips(lang_text('请先完成授权!','Please complete approval first!'), tips_time);
	    });
	}).catch((error)=>{
	    console.log(error);
	    weui.topTips(lang_text('请先切换钱包网络!','Please switch wallet network first!'), tips_time);
	});
    }
}

async function onBoardWithdrawBtnOK(){
    log('onBoardWithdrawBtnOK');
    var input = $('#board_withdraw_amount');
    var selected_chain = parseInt(app.board_selected_chain);
    if(verifyInput(input)){
	checkChain(selected_chain).then((res)=>{
	    var token = contracts[selected_chain].CubeToken.addr;
	    var decimals = contracts[selected_chain].CubeToken.decimals;
	    var spender = contracts[selected_chain].BoardRoom.addr;
	    var amount = toBN(input.val(),decimals);
	    log('BoardWithdraw',token,spender,amount.toString());
	    $('.DialogBtnClose').click();
	    boardWithdraw(amount).then((tx)=>{
		log(tx);
		showSignCallMsg(tx);
	    }).catch((error)=>{
		console.log(error);
		weui.topTips(error.message,tips_time);
	    });
	}).catch((error)=>{
	    console.log(error);
	    weui.topTips(lang_text('请先切换钱包网络!','Please switch wallet network first!'), tips_time);
	});
    }
}

async function boardDeposit(amount){
    var board_addr = contracts[app.board_selected_chain].BoardRoom.addr;
    var board_cntr = contracts[app.board_selected_chain].BoardRoom.cntr;
    var data = board_cntr.methods.deposit(amount).encodeABI();
    return sign_call(board_addr,data);
}

async function boardWithdraw(amount){
    var board_addr = contracts[app.board_selected_chain].BoardRoom.addr;
    var board_cntr = contracts[app.board_selected_chain].BoardRoom.cntr;
    var data = board_cntr.methods.withdraw(amount).encodeABI();
    return sign_call(board_addr,data);
}

async function baordClaim(){
    var board_addr = contracts[app.board_selected_chain].BoardRoom.addr;
    var board_cntr = contracts[app.board_selected_chain].BoardRoom.cntr;
    var data = board_cntr.methods.claim().encodeABI();
    return sign_call(board_addr,data);
}

// home

async function updateHome(){
    log('updateHome');
    app.pools = {};
    await waitForContractInited();
    var loading = weui.loading('loading');
    //app.tvl = 0;
    app.tvl="",
    app.cbt_in_circulation = 0;
    for(var i in activeChains){
	var chainId = activeChains[i];
	var cntr = contracts[chainId].CubeRouter.cntr;
	var pool = await cntr.methods.getPoolInfos().call()
	app.pools[chainId] = pool;
	for(var j in pool){
	    var tvl = await tokenToUSDT(pool[j].token,pool[j].equity);
	    //app.tvl = toBN(app.tvl).add(toBN(tvl));
	    app.tvl += pool[j].symbol+ ' '+ pool[j].equity + '   '
	}

	var airdrop = contracts[chainId].Airdrop.cntr;
	var start_block = await airdrop.methods.startBlock().call();
	var total_reward = await airdrop.methods.totalPendingReward(start_block).call();
	app.cbt_in_circulation = toBN(app.cbt_in_circulation).add(toBN(total_reward));
    }
    loading.hide();
}

async function tokenToUSDT(token,amount){
    return amount;
}


//info

async function updateInfoData(){
    updateHome();
    updateInfoKeyparams();
}

async function updateInfoKeyparams(){
    log('updateInfoKeyparams');
    for(var i in activeChains){
	var chainId = activeChains[i];
	if (app.info_key_params[chainId]==undefined)
	    app.info_key_params[chainId]={};
	var cntr = contracts[chainId].CubeFactory.cntr;
	app.info_key_params[chainId].gun_fee_rate = await cntr.methods.feeToRate().call();
	app.info_key_params[chainId].brdige_fee = await cntr.methods.bridgeFee().call();
	app.info_key_params[chainId].brdige_fee_rate = await cntr.methods.bridgeFeeToRate().call();
    }
    updateInfoKeyparamGasFee();

}

async function updateInfoKeyparamGasFee(){
    log('updateInfoKeyparamGasFee');
    var chain = activeChains[0];
    var router = contracts[chain].CubeRouter.cntr
    var bridge_pool = await router.methods.getBridgePoolInfos().call();
    var factory = contracts[chain].CubeFactory.cntr;
    for(var i in bridge_pool){
	var pool = bridge_pool[i];
	var token = pool.token;
	var symbol = pool.symbol;
	var cntr = new web3s[chain].eth.Contract(abis.ERC20,token);
	var decimals = await cntr.methods.decimals().call();
	var info = {}
	for(var j in activeChains){
	    var chainId = activeChains[j];
	    var gas_fee = await factory.methods.gasFee(token,parseInt(chainId)).call();
	    info[chainId]={gas_fee:gas_fee,decimals:decimals};
	}
	app.info_key_params_gas_fee[symbol]=info
    }
    app.info_key_params_gas_fee_key +=1
}

async function updateInfoStatics(){
    log('updateInfoStatics');
    for(var i in activeChains){
	var chainId = activeChains[i];
	app.info_statics_sheet[chainId]=[];
	// gun pool sheet
	for(var j in app.pools[chainId]){
	    var pool = app.pools[chainId][j];
	    var symbol = pool.symbol;
	    var decimals = pool.token_decimals;
	    var liquidity_token = pool.liquidity_token;
	    var cntr = new web3s[chainId].eth.Contract(abis.CubePool,liquidity_token);
	    var sheet = await cntr.methods.getBalanceSheet().call();
	    app.info_statics_sheet[chainId].push([symbol,decimals,sheet]);
	}
	{
	    // cubetoken sheet
	    var cbt_addr = contracts[chainId].CubeToken.addr;
	    var cntr = new web3s[chainId].eth.Contract(abis.CubePool,cbt_addr);
	    var symbol = 'CBT';
	    var decimals = contracts[chainId].CubeToken.decimals;
	    var sheet = await cntr.methods.getBalanceSheet().call();
	    app.info_statics_sheet[chainId].push([symbol,decimals,sheet]);
	}
    }
    app.info_statics_sheet_key+=1;
    updateInfoStaticsSupply();
}

async function updateInfoStaticsSupply(){
    log('updateInfoStaticsSupply');
    var sum_info = {total_supply:toBN(0),total_reward:toBN(0),total_circulated:toBN(0),decimals:18}
    for(var i in activeChains){
	var chainId = activeChains[i];
	app.info_statics_supply[chainId] = {total_supply:toBN(0),total_reward:toBN(0),total_circulated:toBN(0),decimals:18};
	
	var total_supply = await contracts[chainId].CubeToken.cntr.methods.totalSupply().call();
	var airdrop = contracts[chainId].Airdrop.cntr;
	var start_block = await airdrop.methods.startBlock().call();
	var total_reward = await airdrop.methods.totalPendingReward(start_block).call();
	var decimals = contracts[chainId].CubeToken.decimals;

	app.info_statics_supply[chainId].total_supply = total_supply;
	app.info_statics_supply[chainId].total_reward = total_reward;
	var total_circulated = toBN(total_reward).add(toBN(total_supply)).sub(toBN(21000000).mul(toBN(10**decimals)));
	app.info_statics_supply[chainId].total_circulated = total_circulated;
	app.info_statics_supply[chainId].decimals = decimals;

	sum_info.total_supply = sum_info.total_supply.add(toBN(total_supply));
	sum_info.total_reward = sum_info.total_reward.add(toBN(total_reward));
	sum_info.total_circulated = sum_info.total_circulated.add(toBN(total_circulated));
    }
    app.info_statics_supply_sum = sum_info;
    app.info_statics_supply_key +=1;
}

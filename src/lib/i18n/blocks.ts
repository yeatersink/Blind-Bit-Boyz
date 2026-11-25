export type Cell = { th: boolean; k: string };
export type Block =
	| { t: 'h1' | 'h2' | 'h3' | 'h4' | 'p'; k: string }
	| { t: 'ul' | 'ol'; items: string[] }
	| { t: 'year'; text: string }
	| { t: 'table'; caption: string; head: string[]; rows: Cell[][] };

export const homeProse: Record<string, Block[]> = {
	"chapter-01": [
		{
			"t": "p",
			"k": "body.home.c1.1"
		},
		{
			"t": "p",
			"k": "body.home.c1.2"
		},
		{
			"t": "p",
			"k": "body.home.c1.3"
		},
		{
			"t": "p",
			"k": "body.home.c1.4"
		},
		{
			"t": "p",
			"k": "body.home.c1.5"
		}
	],
	"chapter-02": [
		{
			"t": "p",
			"k": "body.home.c2.6"
		},
		{
			"t": "p",
			"k": "body.home.c2.7"
		},
		{
			"t": "p",
			"k": "body.home.c2.8"
		},
		{
			"t": "p",
			"k": "body.home.c2.9"
		},
		{
			"t": "p",
			"k": "body.home.c2.10"
		}
	],
	"chapter-03": [
		{
			"t": "p",
			"k": "body.home.c3.11"
		},
		{
			"t": "p",
			"k": "body.home.c3.12"
		},
		{
			"t": "p",
			"k": "body.home.c3.13"
		},
		{
			"t": "p",
			"k": "body.home.c3.14"
		},
		{
			"t": "p",
			"k": "body.home.c3.15"
		}
	],
	"chapter-04": [
		{
			"t": "p",
			"k": "body.home.c4.16"
		},
		{
			"t": "p",
			"k": "body.home.c4.17"
		},
		{
			"t": "p",
			"k": "body.home.c4.18"
		},
		{
			"t": "year",
			"text": "2023"
		},
		{
			"t": "p",
			"k": "body.home.c4.19"
		},
		{
			"t": "p",
			"k": "body.home.c4.20"
		},
		{
			"t": "p",
			"k": "body.home.c4.21"
		},
		{
			"t": "p",
			"k": "body.home.c4.22"
		},
		{
			"t": "p",
			"k": "body.home.c4.23"
		}
	],
	"chapter-05": [
		{
			"t": "p",
			"k": "body.home.c5.24"
		},
		{
			"t": "p",
			"k": "body.home.c5.25"
		},
		{
			"t": "p",
			"k": "body.home.c5.26"
		},
		{
			"t": "p",
			"k": "body.home.c5.27"
		},
		{
			"t": "p",
			"k": "body.home.c5.28"
		},
		{
			"t": "p",
			"k": "body.home.c5.29"
		},
		{
			"t": "p",
			"k": "body.home.c5.30"
		}
	],
	"chapter-06": [
		{
			"t": "p",
			"k": "body.home.c6.31"
		},
		{
			"t": "p",
			"k": "body.home.c6.32"
		},
		{
			"t": "p",
			"k": "body.home.c6.33"
		},
		{
			"t": "p",
			"k": "body.home.c6.34"
		},
		{
			"t": "p",
			"k": "body.home.c6.35"
		},
		{
			"t": "p",
			"k": "body.home.c6.36"
		},
		{
			"t": "p",
			"k": "body.home.c6.37"
		}
	],
	"chapter-07": [
		{
			"t": "p",
			"k": "body.home.c7.38"
		},
		{
			"t": "p",
			"k": "body.home.c7.39"
		},
		{
			"t": "p",
			"k": "body.home.c7.40"
		},
		{
			"t": "p",
			"k": "body.home.c7.41"
		},
		{
			"t": "p",
			"k": "body.home.c7.42"
		},
		{
			"t": "p",
			"k": "body.home.c7.43"
		}
	],
	"chapter-08": [
		{
			"t": "p",
			"k": "body.home.c8.44"
		},
		{
			"t": "p",
			"k": "body.home.c8.45"
		},
		{
			"t": "p",
			"k": "body.home.c8.46"
		},
		{
			"t": "p",
			"k": "body.home.c8.47"
		},
		{
			"t": "p",
			"k": "body.home.c8.48"
		},
		{
			"t": "p",
			"k": "body.home.c8.49"
		},
		{
			"t": "p",
			"k": "body.home.c8.50"
		},
		{
			"t": "p",
			"k": "body.home.c8.51"
		},
		{
			"t": "p",
			"k": "body.home.c8.52"
		},
		{
			"t": "p",
			"k": "body.home.c8.53"
		},
		{
			"t": "p",
			"k": "body.home.c8.54"
		},
		{
			"t": "p",
			"k": "body.home.c8.55"
		},
		{
			"t": "p",
			"k": "body.home.c8.56"
		}
	],
	"chapter-09": [
		{
			"t": "p",
			"k": "body.home.c9.57"
		},
		{
			"t": "p",
			"k": "body.home.c9.58"
		},
		{
			"t": "p",
			"k": "body.home.c9.59"
		},
		{
			"t": "p",
			"k": "body.home.c9.60"
		},
		{
			"t": "p",
			"k": "body.home.c9.61"
		}
	],
	"chapter-10": [
		{
			"t": "p",
			"k": "body.home.c10.62"
		},
		{
			"t": "p",
			"k": "body.home.c10.63"
		},
		{
			"t": "p",
			"k": "body.home.c10.64"
		},
		{
			"t": "p",
			"k": "body.home.c10.65"
		}
	],
	"chapter-11": [
		{
			"t": "p",
			"k": "body.home.c11.66"
		},
		{
			"t": "p",
			"k": "body.home.c11.67"
		},
		{
			"t": "p",
			"k": "body.home.c11.68"
		},
		{
			"t": "p",
			"k": "body.home.c11.69"
		},
		{
			"t": "p",
			"k": "body.home.c11.70"
		},
		{
			"t": "p",
			"k": "body.home.c11.71"
		},
		{
			"t": "p",
			"k": "body.home.c11.72"
		},
		{
			"t": "p",
			"k": "body.home.c11.73"
		},
		{
			"t": "p",
			"k": "body.home.c11.74"
		},
		{
			"t": "p",
			"k": "body.home.c11.75"
		}
	],
	"chapter-12": [
		{
			"t": "p",
			"k": "body.home.c12.76"
		},
		{
			"t": "p",
			"k": "body.home.c12.77"
		},
		{
			"t": "p",
			"k": "body.home.c12.78"
		},
		{
			"t": "ul",
			"items": [
				"body.home.c12.79",
				"body.home.c12.80",
				"body.home.c12.81",
				"body.home.c12.82",
				"body.home.c12.83",
				"body.home.c12.84",
				"body.home.c12.85",
				"body.home.c12.86",
				"body.home.c12.87"
			]
		},
		{
			"t": "p",
			"k": "body.home.c12.88"
		},
		{
			"t": "p",
			"k": "body.home.c12.89"
		}
	],
	"chapter-13": [
		{
			"t": "p",
			"k": "body.home.c13.90"
		},
		{
			"t": "p",
			"k": "body.home.c13.91"
		},
		{
			"t": "p",
			"k": "body.home.c13.92"
		},
		{
			"t": "p",
			"k": "body.home.c13.93"
		},
		{
			"t": "p",
			"k": "body.home.c13.94"
		},
		{
			"t": "p",
			"k": "body.home.c13.95"
		}
	],
	"chapter-14": [
		{
			"t": "p",
			"k": "body.home.c14.96"
		},
		{
			"t": "p",
			"k": "body.home.c14.97"
		},
		{
			"t": "p",
			"k": "body.home.c14.98"
		},
		{
			"t": "p",
			"k": "body.home.c14.99"
		},
		{
			"t": "p",
			"k": "body.home.c14.100"
		}
	],
	"chapter-15": [
		{
			"t": "p",
			"k": "body.home.c15.101"
		},
		{
			"t": "p",
			"k": "body.home.c15.102"
		},
		{
			"t": "ul",
			"items": [
				"body.home.c15.103",
				"body.home.c15.104",
				"body.home.c15.105"
			]
		},
		{
			"t": "p",
			"k": "body.home.c15.106"
		},
		{
			"t": "p",
			"k": "body.home.c15.107"
		},
		{
			"t": "ul",
			"items": [
				"body.home.c15.108",
				"body.home.c15.109",
				"body.home.c15.110"
			]
		},
		{
			"t": "p",
			"k": "body.home.c15.111"
		},
		{
			"t": "p",
			"k": "body.home.c15.112"
		}
	]
};

export const learnProse: Record<string, Block[]> = {
	"about": [
		{
			"t": "p",
			"k": "body.learn.about.113"
		},
		{
			"t": "h2",
			"k": "body.learn.about.114"
		},
		{
			"t": "ul",
			"items": [
				"body.learn.about.115",
				"body.learn.about.116",
				"body.learn.about.117"
			]
		},
		{
			"t": "h2",
			"k": "body.learn.about.118"
		},
		{
			"t": "p",
			"k": "body.learn.about.119"
		},
		{
			"t": "p",
			"k": "body.learn.about.120"
		},
		{
			"t": "p",
			"k": "body.learn.about.121"
		},
		{
			"t": "h2",
			"k": "body.learn.about.122"
		},
		{
			"t": "p",
			"k": "body.learn.about.123"
		},
		{
			"t": "h2",
			"k": "body.learn.about.124"
		},
		{
			"t": "ul",
			"items": [
				"body.learn.about.125",
				"body.learn.about.126",
				"body.learn.about.127"
			]
		},
		{
			"t": "p",
			"k": "body.learn.about.128"
		}
	],
	"bitcoin": [
		{
			"t": "p",
			"k": "body.learn.bitcoin.129"
		},
		{
			"t": "h2",
			"k": "body.learn.bitcoin.130"
		},
		{
			"t": "p",
			"k": "body.learn.bitcoin.131"
		},
		{
			"t": "p",
			"k": "body.learn.bitcoin.132"
		},
		{
			"t": "h2",
			"k": "body.learn.bitcoin.133"
		},
		{
			"t": "p",
			"k": "body.learn.bitcoin.134"
		},
		{
			"t": "h2",
			"k": "body.learn.bitcoin.135"
		},
		{
			"t": "p",
			"k": "body.learn.bitcoin.136"
		}
	],
	"bridges": [
		{
			"t": "p",
			"k": "body.learn.bridges.137"
		},
		{
			"t": "h2",
			"k": "body.learn.bridges.138"
		},
		{
			"t": "p",
			"k": "body.learn.bridges.139"
		},
		{
			"t": "h2",
			"k": "body.learn.bridges.140"
		},
		{
			"t": "p",
			"k": "body.learn.bridges.141"
		},
		{
			"t": "h2",
			"k": "body.learn.bridges.142"
		},
		{
			"t": "p",
			"k": "body.learn.bridges.143"
		}
	],
	"buy-crypto": [
		{
			"t": "p",
			"k": "body.learn.buy-crypto.144"
		},
		{
			"t": "h2",
			"k": "body.learn.buy-crypto.145"
		},
		{
			"t": "p",
			"k": "body.learn.buy-crypto.146"
		},
		{
			"t": "h2",
			"k": "body.learn.buy-crypto.147"
		},
		{
			"t": "p",
			"k": "body.learn.buy-crypto.148"
		},
		{
			"t": "h2",
			"k": "body.learn.buy-crypto.149"
		},
		{
			"t": "p",
			"k": "body.learn.buy-crypto.150"
		}
	],
	"chains": [
		{
			"t": "p",
			"k": "body.learn.chains.151"
		},
		{
			"t": "h2",
			"k": "body.learn.chains.152"
		},
		{
			"t": "table",
			"caption": "body.learn.chains.188",
			"head": [
				"body.learn.chains.153",
				"body.learn.chains.154",
				"body.learn.chains.155",
				"body.learn.chains.156",
				"body.learn.chains.157"
			],
			"rows": [
				[
					{
						"th": true,
						"k": "body.learn.chains.158"
					},
					{
						"th": false,
						"k": "body.learn.chains.159"
					},
					{
						"th": false,
						"k": "body.learn.chains.160"
					},
					{
						"th": false,
						"k": "body.learn.chains.161"
					},
					{
						"th": false,
						"k": "body.learn.chains.162"
					}
				],
				[
					{
						"th": true,
						"k": "body.learn.chains.163"
					},
					{
						"th": false,
						"k": "body.learn.chains.164"
					},
					{
						"th": false,
						"k": "body.learn.chains.165"
					},
					{
						"th": false,
						"k": "body.learn.chains.166"
					},
					{
						"th": false,
						"k": "body.learn.chains.167"
					}
				],
				[
					{
						"th": true,
						"k": "body.learn.chains.168"
					},
					{
						"th": false,
						"k": "body.learn.chains.169"
					},
					{
						"th": false,
						"k": "body.learn.chains.170"
					},
					{
						"th": false,
						"k": "body.learn.chains.171"
					},
					{
						"th": false,
						"k": "body.learn.chains.172"
					}
				],
				[
					{
						"th": true,
						"k": "body.learn.chains.173"
					},
					{
						"th": false,
						"k": "body.learn.chains.174"
					},
					{
						"th": false,
						"k": "body.learn.chains.175"
					},
					{
						"th": false,
						"k": "body.learn.chains.176"
					},
					{
						"th": false,
						"k": "body.learn.chains.177"
					}
				],
				[
					{
						"th": true,
						"k": "body.learn.chains.178"
					},
					{
						"th": false,
						"k": "body.learn.chains.179"
					},
					{
						"th": false,
						"k": "body.learn.chains.180"
					},
					{
						"th": false,
						"k": "body.learn.chains.181"
					},
					{
						"th": false,
						"k": "body.learn.chains.182"
					}
				],
				[
					{
						"th": true,
						"k": "body.learn.chains.183"
					},
					{
						"th": false,
						"k": "body.learn.chains.184"
					},
					{
						"th": false,
						"k": "body.learn.chains.185"
					},
					{
						"th": false,
						"k": "body.learn.chains.186"
					},
					{
						"th": false,
						"k": "body.learn.chains.187"
					}
				]
			]
		},
		{
			"t": "h2",
			"k": "body.learn.chains.189"
		},
		{
			"t": "p",
			"k": "body.learn.chains.190"
		},
		{
			"t": "h2",
			"k": "body.learn.chains.191"
		},
		{
			"t": "p",
			"k": "body.learn.chains.192"
		},
		{
			"t": "p",
			"k": "body.learn.chains.193"
		},
		{
			"t": "h2",
			"k": "body.learn.chains.194"
		},
		{
			"t": "p",
			"k": "body.learn.chains.195"
		},
		{
			"t": "h2",
			"k": "body.learn.chains.196"
		},
		{
			"t": "p",
			"k": "body.learn.chains.197"
		}
	],
	"custody": [
		{
			"t": "p",
			"k": "body.learn.custody.198"
		},
		{
			"t": "h2",
			"k": "body.learn.custody.199"
		},
		{
			"t": "p",
			"k": "body.learn.custody.200"
		},
		{
			"t": "p",
			"k": "body.learn.custody.201"
		},
		{
			"t": "h2",
			"k": "body.learn.custody.202"
		},
		{
			"t": "p",
			"k": "body.learn.custody.203"
		},
		{
			"t": "h2",
			"k": "body.learn.custody.204"
		},
		{
			"t": "p",
			"k": "body.learn.custody.205"
		},
		{
			"t": "p",
			"k": "body.learn.custody.206"
		},
		{
			"t": "h2",
			"k": "body.learn.custody.207"
		},
		{
			"t": "p",
			"k": "body.learn.custody.208"
		},
		{
			"t": "h2",
			"k": "body.learn.custody.209"
		},
		{
			"t": "p",
			"k": "body.learn.custody.210"
		},
		{
			"t": "h2",
			"k": "body.learn.custody.211"
		},
		{
			"t": "p",
			"k": "body.learn.custody.212"
		},
		{
			"t": "ul",
			"items": [
				"body.learn.custody.213",
				"body.learn.custody.214",
				"body.learn.custody.215",
				"body.learn.custody.216"
			]
		},
		{
			"t": "h2",
			"k": "body.learn.custody.217"
		},
		{
			"t": "p",
			"k": "body.learn.custody.218"
		}
	],
	"dex": [
		{
			"t": "p",
			"k": "body.learn.dex.219"
		},
		{
			"t": "h2",
			"k": "body.learn.dex.220"
		},
		{
			"t": "p",
			"k": "body.learn.dex.221"
		},
		{
			"t": "h2",
			"k": "body.learn.dex.222"
		},
		{
			"t": "ol",
			"items": [
				"body.learn.dex.223",
				"body.learn.dex.224"
			]
		},
		{
			"t": "h2",
			"k": "body.learn.dex.225"
		},
		{
			"t": "p",
			"k": "body.learn.dex.226"
		},
		{
			"t": "p",
			"k": "body.learn.dex.227"
		},
		{
			"t": "h2",
			"k": "body.learn.dex.228"
		},
		{
			"t": "p",
			"k": "body.learn.dex.229"
		},
		{
			"t": "ul",
			"items": [
				"body.learn.dex.230",
				"body.learn.dex.231",
				"body.learn.dex.232",
				"body.learn.dex.233",
				"body.learn.dex.234",
				"body.learn.dex.235",
				"body.learn.dex.236"
			]
		},
		{
			"t": "p",
			"k": "body.learn.dex.237"
		},
		{
			"t": "h2",
			"k": "body.learn.dex.238"
		},
		{
			"t": "p",
			"k": "body.learn.dex.239"
		},
		{
			"t": "h2",
			"k": "body.learn.dex.240"
		},
		{
			"t": "p",
			"k": "body.learn.dex.241"
		}
	],
	"ethereum": [
		{
			"t": "p",
			"k": "body.learn.ethereum.242"
		},
		{
			"t": "h2",
			"k": "body.learn.ethereum.243"
		},
		{
			"t": "p",
			"k": "body.learn.ethereum.244"
		},
		{
			"t": "h2",
			"k": "body.learn.ethereum.245"
		},
		{
			"t": "p",
			"k": "body.learn.ethereum.246"
		},
		{
			"t": "p",
			"k": "body.learn.ethereum.247"
		},
		{
			"t": "h2",
			"k": "body.learn.ethereum.248"
		},
		{
			"t": "p",
			"k": "body.learn.ethereum.249"
		}
	],
	"explorers": [
		{
			"t": "p",
			"k": "body.learn.explorers.250"
		},
		{
			"t": "h2",
			"k": "body.learn.explorers.251"
		},
		{
			"t": "p",
			"k": "body.learn.explorers.252"
		},
		{
			"t": "p",
			"k": "body.learn.explorers.253"
		},
		{
			"t": "h2",
			"k": "body.learn.explorers.254"
		},
		{
			"t": "p",
			"k": "body.learn.explorers.255"
		},
		{
			"t": "h2",
			"k": "body.learn.explorers.256"
		},
		{
			"t": "p",
			"k": "body.learn.explorers.257"
		},
		{
			"t": "ol",
			"items": [
				"body.learn.explorers.258",
				"body.learn.explorers.259",
				"body.learn.explorers.260",
				"body.learn.explorers.261",
				"body.learn.explorers.262",
				"body.learn.explorers.263"
			]
		},
		{
			"t": "h2",
			"k": "body.learn.explorers.264"
		},
		{
			"t": "p",
			"k": "body.learn.explorers.265"
		},
		{
			"t": "h2",
			"k": "body.learn.explorers.266"
		},
		{
			"t": "p",
			"k": "body.learn.explorers.267"
		},
		{
			"t": "ul",
			"items": [
				"body.learn.explorers.268",
				"body.learn.explorers.269",
				"body.learn.explorers.270",
				"body.learn.explorers.271",
				"body.learn.explorers.272",
				"body.learn.explorers.273",
				"body.learn.explorers.274",
				"body.learn.explorers.275",
				"body.learn.explorers.276"
			]
		},
		{
			"t": "p",
			"k": "body.learn.explorers.277"
		}
	],
	"nodes": [
		{
			"t": "p",
			"k": "body.learn.nodes.278"
		},
		{
			"t": "p",
			"k": "body.learn.nodes.279"
		},
		{
			"t": "h2",
			"k": "body.learn.nodes.280"
		},
		{
			"t": "ul",
			"items": [
				"body.learn.nodes.281",
				"body.learn.nodes.282",
				"body.learn.nodes.283"
			]
		},
		{
			"t": "h2",
			"k": "body.learn.nodes.284"
		},
		{
			"t": "p",
			"k": "body.learn.nodes.285"
		},
		{
			"t": "h2",
			"k": "body.learn.nodes.286"
		},
		{
			"t": "p",
			"k": "body.learn.nodes.287"
		},
		{
			"t": "h2",
			"k": "body.learn.nodes.288"
		},
		{
			"t": "p",
			"k": "body.learn.nodes.289"
		},
		{
			"t": "h2",
			"k": "body.learn.nodes.290"
		},
		{
			"t": "p",
			"k": "body.learn.nodes.291"
		},
		{
			"t": "h2",
			"k": "body.learn.nodes.292"
		},
		{
			"t": "p",
			"k": "body.learn.nodes.293"
		},
		{
			"t": "p",
			"k": "body.learn.nodes.294"
		},
		{
			"t": "p",
			"k": "body.learn.nodes.295"
		},
		{
			"t": "p",
			"k": "body.learn.nodes.296"
		}
	],
	"policy": [
		{
			"t": "p",
			"k": "body.learn.policy.297"
		},
		{
			"t": "h2",
			"k": "body.learn.policy.298"
		},
		{
			"t": "p",
			"k": "body.learn.policy.299"
		},
		{
			"t": "p",
			"k": "body.learn.policy.300"
		},
		{
			"t": "h2",
			"k": "body.learn.policy.301"
		},
		{
			"t": "p",
			"k": "body.learn.policy.302"
		},
		{
			"t": "h2",
			"k": "body.learn.policy.303"
		},
		{
			"t": "p",
			"k": "body.learn.policy.304"
		},
		{
			"t": "h2",
			"k": "body.learn.policy.305"
		},
		{
			"t": "p",
			"k": "body.learn.policy.306"
		},
		{
			"t": "h2",
			"k": "body.learn.policy.307"
		},
		{
			"t": "p",
			"k": "body.learn.policy.308"
		}
	],
	"privacy": [
		{
			"t": "p",
			"k": "body.learn.privacy.309"
		},
		{
			"t": "h2",
			"k": "body.learn.privacy.310"
		},
		{
			"t": "p",
			"k": "body.learn.privacy.311"
		},
		{
			"t": "h2",
			"k": "body.learn.privacy.312"
		},
		{
			"t": "p",
			"k": "body.learn.privacy.313"
		},
		{
			"t": "h2",
			"k": "body.learn.privacy.314"
		},
		{
			"t": "p",
			"k": "body.learn.privacy.315"
		},
		{
			"t": "h2",
			"k": "body.learn.privacy.316"
		},
		{
			"t": "p",
			"k": "body.learn.privacy.317"
		},
		{
			"t": "h2",
			"k": "body.learn.privacy.318"
		},
		{
			"t": "p",
			"k": "body.learn.privacy.319"
		},
		{
			"t": "p",
			"k": "body.learn.privacy.320"
		},
		{
			"t": "p",
			"k": "body.learn.privacy.321"
		}
	],
	"smart-contracts": [
		{
			"t": "p",
			"k": "body.learn.smart-contracts.322"
		},
		{
			"t": "p",
			"k": "body.learn.smart-contracts.323"
		},
		{
			"t": "h2",
			"k": "body.learn.smart-contracts.324"
		},
		{
			"t": "p",
			"k": "body.learn.smart-contracts.325"
		},
		{
			"t": "h2",
			"k": "body.learn.smart-contracts.326"
		},
		{
			"t": "p",
			"k": "body.learn.smart-contracts.327"
		},
		{
			"t": "h2",
			"k": "body.learn.smart-contracts.328"
		},
		{
			"t": "p",
			"k": "body.learn.smart-contracts.329"
		},
		{
			"t": "h2",
			"k": "body.learn.smart-contracts.330"
		},
		{
			"t": "p",
			"k": "body.learn.smart-contracts.331"
		},
		{
			"t": "h2",
			"k": "body.learn.smart-contracts.332"
		},
		{
			"t": "p",
			"k": "body.learn.smart-contracts.333"
		},
		{
			"t": "p",
			"k": "body.learn.smart-contracts.334"
		},
		{
			"t": "p",
			"k": "body.learn.smart-contracts.335"
		},
		{
			"t": "p",
			"k": "body.learn.smart-contracts.336"
		},
		{
			"t": "h2",
			"k": "body.learn.smart-contracts.337"
		},
		{
			"t": "p",
			"k": "body.learn.smart-contracts.338"
		},
		{
			"t": "h2",
			"k": "body.learn.smart-contracts.339"
		},
		{
			"t": "p",
			"k": "body.learn.smart-contracts.340"
		},
		{
			"t": "h2",
			"k": "body.learn.smart-contracts.341"
		},
		{
			"t": "p",
			"k": "body.learn.smart-contracts.342"
		},
		{
			"t": "h2",
			"k": "body.learn.smart-contracts.343"
		},
		{
			"t": "p",
			"k": "body.learn.smart-contracts.344"
		},
		{
			"t": "ol",
			"items": [
				"body.learn.smart-contracts.345",
				"body.learn.smart-contracts.346",
				"body.learn.smart-contracts.347"
			]
		},
		{
			"t": "h2",
			"k": "body.learn.smart-contracts.348"
		},
		{
			"t": "p",
			"k": "body.learn.smart-contracts.349"
		},
		{
			"t": "p",
			"k": "body.learn.smart-contracts.350"
		},
		{
			"t": "p",
			"k": "body.learn.smart-contracts.351"
		},
		{
			"t": "p",
			"k": "body.learn.smart-contracts.352"
		}
	],
	"wallets": [
		{
			"t": "p",
			"k": "body.learn.wallets.353"
		},
		{
			"t": "h2",
			"k": "body.learn.wallets.354"
		},
		{
			"t": "p",
			"k": "body.learn.wallets.355"
		},
		{
			"t": "h2",
			"k": "body.learn.wallets.356"
		},
		{
			"t": "p",
			"k": "body.learn.wallets.357"
		},
		{
			"t": "h2",
			"k": "body.learn.wallets.358"
		},
		{
			"t": "p",
			"k": "body.learn.wallets.359"
		},
		{
			"t": "h2",
			"k": "body.learn.wallets.360"
		},
		{
			"t": "p",
			"k": "body.learn.wallets.361"
		},
		{
			"t": "p",
			"k": "body.learn.wallets.362"
		},
		{
			"t": "ul",
			"items": [
				"body.learn.wallets.363",
				"body.learn.wallets.364",
				"body.learn.wallets.365"
			]
		}
	],
	"yield": [
		{
			"t": "p",
			"k": "body.learn.yield.366"
		},
		{
			"t": "h2",
			"k": "body.learn.yield.367"
		},
		{
			"t": "p",
			"k": "body.learn.yield.368"
		},
		{
			"t": "p",
			"k": "body.learn.yield.369"
		},
		{
			"t": "h2",
			"k": "body.learn.yield.370"
		},
		{
			"t": "p",
			"k": "body.learn.yield.371"
		},
		{
			"t": "h2",
			"k": "body.learn.yield.372"
		},
		{
			"t": "p",
			"k": "body.learn.yield.373"
		},
		{
			"t": "h2",
			"k": "body.learn.yield.374"
		},
		{
			"t": "p",
			"k": "body.learn.yield.375"
		}
	]
};

export const pageProse: Record<string, Block[]> = {
	"tools": [
		{
			"t": "h1",
			"k": "body.page.tools.h1"
		},
		{
			"t": "p",
			"k": "body.page.tools.376"
		},
		{
			"t": "h2",
			"k": "body.page.tools.377"
		},
		{
			"t": "p",
			"k": "body.page.tools.378"
		},
		{
			"t": "p",
			"k": "body.page.tools.379"
		},
		{
			"t": "h2",
			"k": "body.page.tools.380"
		},
		{
			"t": "p",
			"k": "body.page.tools.381"
		},
		{
			"t": "p",
			"k": "body.page.tools.382"
		},
		{
			"t": "h2",
			"k": "body.page.tools.383"
		},
		{
			"t": "p",
			"k": "body.page.tools.384"
		},
		{
			"t": "p",
			"k": "body.page.tools.385"
		},
		{
			"t": "h2",
			"k": "body.page.tools.386"
		},
		{
			"t": "p",
			"k": "body.page.tools.387"
		},
		{
			"t": "p",
			"k": "body.page.tools.388"
		},
		{
			"t": "h2",
			"k": "body.page.tools.389"
		},
		{
			"t": "p",
			"k": "body.page.tools.390"
		},
		{
			"t": "p",
			"k": "body.page.tools.391"
		},
		{
			"t": "h2",
			"k": "body.page.tools.392"
		},
		{
			"t": "p",
			"k": "body.page.tools.393"
		},
		{
			"t": "p",
			"k": "body.page.tools.394"
		},
		{
			"t": "h2",
			"k": "body.page.tools.395"
		},
		{
			"t": "p",
			"k": "body.page.tools.396"
		},
		{
			"t": "p",
			"k": "body.page.tools.397"
		},
		{
			"t": "h2",
			"k": "body.page.tools.398"
		},
		{
			"t": "p",
			"k": "body.page.tools.399"
		},
		{
			"t": "p",
			"k": "body.page.tools.400"
		},
		{
			"t": "h2",
			"k": "body.page.tools.401"
		},
		{
			"t": "p",
			"k": "body.page.tools.402"
		},
		{
			"t": "p",
			"k": "body.page.tools.403"
		},
		{
			"t": "p",
			"k": "body.page.tools.404"
		}
	],
	"instructions": [
		{
			"t": "h1",
			"k": "body.page.instructions.h1"
		},
		{
			"t": "p",
			"k": "body.page.instructions.405"
		},
		{
			"t": "h2",
			"k": "body.page.instructions.406"
		},
		{
			"t": "p",
			"k": "body.page.instructions.407"
		},
		{
			"t": "ol",
			"items": [
				"body.page.instructions.408",
				"body.page.instructions.409",
				"body.page.instructions.410",
				"body.page.instructions.411",
				"body.page.instructions.412",
				"body.page.instructions.413",
				"body.page.instructions.414",
				"body.page.instructions.415",
				"body.page.instructions.416"
			]
		},
		{
			"t": "p",
			"k": "body.page.instructions.417"
		},
		{
			"t": "p",
			"k": "body.page.instructions.418"
		},
		{
			"t": "h2",
			"k": "body.page.instructions.419"
		},
		{
			"t": "p",
			"k": "body.page.instructions.420"
		},
		{
			"t": "ol",
			"items": [
				"body.page.instructions.421",
				"body.page.instructions.422",
				"body.page.instructions.423",
				"body.page.instructions.424",
				"body.page.instructions.425",
				"body.page.instructions.426",
				"body.page.instructions.427",
				"body.page.instructions.428",
				"body.page.instructions.429"
			]
		},
		{
			"t": "h2",
			"k": "body.page.instructions.430"
		},
		{
			"t": "ul",
			"items": [
				"body.page.instructions.431",
				"body.page.instructions.432",
				"body.page.instructions.433"
			]
		},
		{
			"t": "p",
			"k": "body.page.instructions.434"
		}
	],
	"links": [
		{
			"t": "h1",
			"k": "body.page.links.h1"
		},
		{
			"t": "p",
			"k": "body.page.links.435"
		},
		{
			"t": "p",
			"k": "body.page.links.436"
		},
		{
			"t": "h2",
			"k": "body.page.links.437"
		},
		{
			"t": "ul",
			"items": [
				"body.page.links.438",
				"body.page.links.439",
				"body.page.links.440",
				"body.page.links.441",
				"body.page.links.442"
			]
		},
		{
			"t": "h2",
			"k": "body.page.links.443"
		},
		{
			"t": "ul",
			"items": [
				"body.page.links.444",
				"body.page.links.445",
				"body.page.links.446",
				"body.page.links.447",
				"body.page.links.448",
				"body.page.links.449"
			]
		},
		{
			"t": "h2",
			"k": "body.page.links.450"
		},
		{
			"t": "ul",
			"items": [
				"body.page.links.451",
				"body.page.links.452",
				"body.page.links.453",
				"body.page.links.454",
				"body.page.links.455"
			]
		},
		{
			"t": "h2",
			"k": "body.page.links.456"
		},
		{
			"t": "ul",
			"items": [
				"body.page.links.457",
				"body.page.links.458",
				"body.page.links.459",
				"body.page.links.460",
				"body.page.links.461",
				"body.page.links.462",
				"body.page.links.463",
				"body.page.links.464",
				"body.page.links.465",
				"body.page.links.466",
				"body.page.links.467",
				"body.page.links.468",
				"body.page.links.469",
				"body.page.links.470"
			]
		},
		{
			"t": "h2",
			"k": "body.page.links.471"
		},
		{
			"t": "ul",
			"items": [
				"body.page.links.472",
				"body.page.links.473",
				"body.page.links.474",
				"body.page.links.475",
				"body.page.links.476"
			]
		},
		{
			"t": "h2",
			"k": "body.page.links.477"
		},
		{
			"t": "ul",
			"items": [
				"body.page.links.478",
				"body.page.links.479",
				"body.page.links.480",
				"body.page.links.481",
				"body.page.links.482"
			]
		},
		{
			"t": "h2",
			"k": "body.page.links.483"
		},
		{
			"t": "ul",
			"items": [
				"body.page.links.484"
			]
		},
		{
			"t": "p",
			"k": "body.page.links.485"
		},
		{
			"t": "h2",
			"k": "body.page.links.486"
		},
		{
			"t": "ul",
			"items": [
				"body.page.links.487",
				"body.page.links.488",
				"body.page.links.489",
				"body.page.links.490",
				"body.page.links.491"
			]
		},
		{
			"t": "h3",
			"k": "body.page.links.492"
		},
		{
			"t": "ul",
			"items": [
				"body.page.links.493",
				"body.page.links.494"
			]
		},
		{
			"t": "h3",
			"k": "body.page.links.495"
		},
		{
			"t": "ul",
			"items": [
				"body.page.links.496",
				"body.page.links.497",
				"body.page.links.498",
				"body.page.links.499"
			]
		},
		{
			"t": "h2",
			"k": "body.page.links.500"
		},
		{
			"t": "ul",
			"items": [
				"body.page.links.501",
				"body.page.links.502",
				"body.page.links.503"
			]
		},
		{
			"t": "h2",
			"k": "body.page.links.504"
		},
		{
			"t": "ul",
			"items": [
				"body.page.links.505",
				"body.page.links.506",
				"body.page.links.507"
			]
		},
		{
			"t": "h2",
			"k": "body.page.links.508"
		},
		{
			"t": "ul",
			"items": [
				"body.page.links.509",
				"body.page.links.510",
				"body.page.links.511",
				"body.page.links.512",
				"body.page.links.513"
			]
		},
		{
			"t": "h2",
			"k": "body.page.links.514"
		},
		{
			"t": "ul",
			"items": [
				"body.page.links.515"
			]
		},
		{
			"t": "h2",
			"k": "body.page.links.516"
		},
		{
			"t": "ul",
			"items": [
				"body.page.links.517",
				"body.page.links.518",
				"body.page.links.519",
				"body.page.links.520"
			]
		}
	]
};
